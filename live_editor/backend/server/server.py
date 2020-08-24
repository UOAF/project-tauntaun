from quart import Quart, make_response
from quart import websocket
from functools import wraps

from server.mission_encoder import MissionEncoder

from hypercorn.config import Config
from hypercorn.asyncio import serve
import asyncio

import signal
import json

import logging

from sessions import SessionsEncoder

logger = logging.basicConfig(level=logging.DEBUG)


def plain_text_response(x):
    resp = make_response(str(x))
    resp.headers["Content-Type"] = "text/plain; charset=utf-8"
    return resp

def create_app(campaign, session_manager):
    app = Quart(__name__)
    @app.route('/game/mission')
    async def render_mission():
        return json.dumps(campaign.mission, convert_coords=True, add_sidc=True, cls=MissionEncoder)

    @app.route('/game/sessions')
    async def render_sessions():
        return json.dumps(session_manager.sessions, cls=SessionsEncoder)

    ws_clients = {}
    def collect_websocket(on_connect, on_disconnect):
        def wrapper_0(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                id = wrapper.id_counter
                ws_clients[id] = websocket._get_current_object()
                print(f"adding ws client {id}")
                on_connect(id)
                await ws_clients[id].send(json.dumps({
                    'key': 'registration_data',
                    'value': id
                }))
                wrapper.id_counter += 1
                try:
                    return await func(*args, **kwargs)
                finally:
                    print(f"removing ws client {id}")
                    del ws_clients[id]
                    on_disconnect(id)

            wrapper.id_counter = 0

            return wrapper
        return wrapper_0

    async def broadcast(message):
         for ws_id in ws_clients:
             ws = ws_clients[ws_id]
             await ws.send(message)

    @app.websocket('/ws/update')
    @collect_websocket(session_manager.register, session_manager.deregister)
    async def client_update_ws():
        while True:
            data = await websocket.receive()
            print(data)
            data = json.loads(data)
            update_type = data['key']
            game_service = campaign.game_service
            group_route_request_handler = game_service.group_route_request_handler

            async def broadcast_update():
                broadcast_data = {'key': 'mission_updated', 'value': campaign.mission}
                await broadcast(json.dumps(broadcast_data, convert_coords=True, add_sidc=True, cls=MissionEncoder))

            async def broadcast_session_update():
                broadcast_data = {'key': 'sessions_updated', 'value': session_manager.sessions}
                await broadcast(json.dumps(broadcast_data, cls=SessionsEncoder))

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
                    group_data['location'], group_data['airport'], group_data['plane'], group_data['number_of_planes'])

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

            dispatch_map = {
                'group_route_insert_at': group_route_insert_at,
                'group_route_remove': group_route_remove,
                'group_route_modify': group_route_modify,
                'save_mission': save_mission,
                'load_mission': load_mission,
                'add_flight': add_flight,
                'unit_loadout_update': unit_loadout_update,
                'session_data_update': session_data_update
            }

            try:
                await dispatch_map[update_type](data['value'])
            except KeyError():
                # TODO log error
                pass

    return app




def run(campaign, session_maanger, port=80):
    app = create_app(campaign, session_maanger)

    shutdown_event = asyncio.Event()

    def _signal_handler(*_):
        quit() # TODO not nice but the graceful shutdown is not working
        shutdown_event.set()

    loop = asyncio.get_event_loop()
    signal.signal(signal.SIGINT, _signal_handler)
    signal.signal(signal.SIGTERM, _signal_handler)

    config = Config()
    config.bind = ["0.0.0.0:" + str(port)]  # As an example configuration setting

    loop.run_until_complete(
        serve(app, config, shutdown_trigger=shutdown_event.wait)
    )
