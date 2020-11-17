import os
import signal
import json
import asyncio
import logging
from functools import wraps

from quart import Quart, send_from_directory, make_response
from quart import websocket
from hypercorn.config import Config
from hypercorn.asyncio import serve

from tauntaun_live_editor.sessions import SessionsEncoder
from tauntaun_live_editor.util import get_data_path, is_posix
import tauntaun_live_editor.config as config
from .mission_encoder import MissionEncoder
from concurrent.futures import thread

logger = logging.basicConfig(level=logging.DEBUG)

def plain_text_response(x):
    resp = make_response(str(x))
    resp.headers["Content-Type"] = "text/plain; charset=utf-8"
    return resp

def create_app(campaign, session_manager):
    data_dir = get_data_path()
    ws_clients = {}

    app = Quart(__name__, static_folder=os.path.join(data_dir, 'client', 'static'),
                template_folder=os.path.join(data_dir, 'client'))

    @app.route('/', defaults={'path': 'index.html'})
    async def send_root(path):
        return await send_from_directory(os.path.join(data_dir, 'client'), path)

    @app.route('/<path:path>')
    async def send_static_root(path):
        return await send_from_directory(os.path.join(data_dir, 'client'), path)

    @app.route('/static/<path:path>')
    async def send_static(path):
        return await send_from_directory(os.path.join(data_dir, 'client', 'static'), path)

    @app.route('/game/mission')
    async def render_mission():
        return json.dumps(campaign.mission, terrain=campaign.mission.terrain, convert_coords=True, add_sidc=True, cls=MissionEncoder)

    @app.route('/game/sessions')
    async def render_sessions():
        return json.dumps(session_manager.sessions, cls=SessionsEncoder)

    @app.route('/game/map_token')
    async def render_map_token():
        return config.config.map_token

    @app.route('/game/auth_admin/<password>')
    async def render_auth_admin_password(password):
        return 'true' if config.config.admin_password == password else 'false'

    def collect_websocket(on_connect, on_disconnect):
        def wrapper_0(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                id = wrapper.id_counter
                ws_clients[id] = websocket._get_current_object()
                print(f"adding ws client {id}")
                on_connect(id)
                wrapper.id_counter += 1

                try:
                    return await func(*args, **kwargs)
                finally:
                    print(f"removing ws client {id}")
                    del ws_clients[id]
                    await on_disconnect(id)

            wrapper.id_counter = 0

            return wrapper
        return wrapper_0

    async def broadcast(message):
         for ws_id in ws_clients:
             ws = ws_clients[ws_id]
             await ws.send(message)

    async def broadcast_session_update():
        broadcast_data = {'key': 'sessions_updated', 'value': session_manager.sessions}
        await broadcast(json.dumps(broadcast_data, cls=SessionsEncoder))


    async def on_ws_disconnect(id):
        session_manager.deregister(id)
        await broadcast_session_update()

    @app.websocket('/ws/message')
    @collect_websocket(session_manager.register, on_ws_disconnect)
    async def client_update_ws():
        while True:
            ws = websocket._get_current_object()
            ws_id = next(key for key, value in ws_clients.items() if value == ws)
            if ws_id == -1:
                print("Invalid client request")
                return

            data = await websocket.receive()
            print(f"$Client_id: {ws_id}, Data: ${data}")
            data = json.loads(data)
            update_type = data['key']
            game_service = campaign.game_service
            group_route_request_handler = game_service.group_route_request_handler

            async def broadcast_update():
                broadcast_data = {'key': 'mission_updated', 'value': campaign.mission}
                await broadcast(json.dumps(broadcast_data, terrain=campaign.mission.terrain, convert_coords=True, add_sidc=True, cls=MissionEncoder))

            async def group_route_insert_at(group_data):
                group_route_request_handler.insert_at(
                    group_data['id'], group_data['new'], group_data['at'])

                await broadcast_update()

            async def group_route_remove(group_data):                
                group_route_request_handler.remove(
                    group_data['id'], group_data['point'])

                await broadcast_update()

            async def group_route_modify(group_data):
                group_route_request_handler.modify(
                    group_data['id'], group_data['old'], group_data['new'])

                await broadcast_update()

            async def add_flight(group_data):
                game_service.add_flight(
                    group_data['coalition'],
                    group_data['country'],
                    group_data['location'],
                    group_data['airport'],
                    group_data['plane'],
                    group_data['number_of_planes'])

                await broadcast_update()

            async def save_mission(data):
                campaign.save_mission()

            async def load_mission(data):
                campaign.load_mission()

                await broadcast_update()

            async def unit_loadout_update(unit_data):
                game_service.update_unit_loadout(
                    unit_data['id'], unit_data['pylons'], unit_data['chaff'], unit_data['flare'], unit_data['gun'], unit_data['fuel'])

                await broadcast_update()

            async def session_data_update(data):
                session_manager.update_session(
                    data['id'], data['session_data'])

                await broadcast_session_update()

            async def request_session_id(data):
                await ws.send(json.dumps({
                    'key': 'sessionid',
                    'value': ws_id
                }))

            dispatch_map = {
                'group_route_insert_at': group_route_insert_at,
                'group_route_remove': group_route_remove,
                'group_route_modify': group_route_modify,
                'save_mission': save_mission,
                'load_mission': load_mission,
                'add_flight': add_flight,
                'unit_loadout_update': unit_loadout_update,
                'session_data_update': session_data_update,
                'request_session_id': request_session_id,
            }

            await dispatch_map[update_type](data['value'])

    return app


def run(campaign, session_maanger, port=80):
    app = create_app(campaign, session_maanger)

    shutdown_event = asyncio.Event()

    def _signal_handler(*_):
        shutdown_event.set()

    def _exception_handler(context):
        exception = context.get("exception")
        shutdown_event.set()
        raise(exception)        

    loop = asyncio.get_event_loop()
    loop.set_exception_handler(_exception_handler)
    if is_posix():
        loop.add_signal_handler(signal.SIGINT, _signal_handler)
        loop.add_signal_handler(signal.SIGTERM, _signal_handler)

    config = Config()
    config.bind = ["0.0.0.0:" + str(port)]

    loop.run_until_complete(
        serve(app, config, shutdown_trigger=shutdown_event.wait)
    )
