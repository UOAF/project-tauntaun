from quart import Quart, render_template, send_from_directory, make_response, jsonify, abort

from unit_sidc import sidc_map

from util import fixup_jsonlike
from hypercorn.config import Config
from hypercorn.asyncio import serve
import asyncio

import signal

from coord import xz_to_lat_lon


import logging
logging.basicConfig(level=logging.DEBUG)


def plain_text_response(x):
    resp = make_response(str(x))
    resp.headers["Content-Type"] = "text/plain; charset=utf-8"
    return resp


def collect_basic_unit_info(group):
    g = group
    pos = g.units[0].position
    lat, lon = xz_to_lat_lon(pos.x, pos.y)
    pos = {
        'lat': lat,
        'lon': lon
    }

    print(f"group {g.name}")

    def to_latlon(p):
        lat, lon = xz_to_lat_lon(p['x'], p['y'])
        p['lat'] = lat
        p['lon'] = lon
        return p

    points = [to_latlon(fixup_jsonlike(p.dict())) for p in g.points]

    data = {
        'id': g.id,
        'name': str(g.name),
        'num': len(g.units),
        'sidc': sidc_map[g.units[0].type],
        'position': pos,
        'points': points,
    }
    return data


def create_app(campaign):
    app = Quart(__name__, static_folder='static',
                template_folder='static')

    @app.route('/', defaults={'path': 'map.html'})
    @app.route('/static/<path:path>')
    async def send_static(path):
        return await send_from_directory('server/static', path)

    def validate_coalition(c):
        if not c in campaign.mission.coalition:
            abort(404)

    @app.route('/game/plane_groups/<string:coalition>')
    async def render_plane_groups(coalition):
        validate_coalition(coalition)
        groups = campaign.get_plane_groups(side=coalition)

        def render_plane_group(g):
            unit_data = collect_basic_unit_info(g)
            unit_data['callsign'] = g.units[0].callsign_dict['name'][:-1]
            return unit_data

        return jsonify([render_plane_group(g) for g in groups])

    @app.route('/game/ships/<string:coalition>')
    async def render_ship_groups(coalition):
        validate_coalition(coalition)
        groups = campaign.get_ship_groups(side=coalition)
        return jsonify([collect_basic_unit_info(g) for g in groups])

    return app


def run(campaign, port=80):
    app = create_app(campaign)

    shutdown_event = asyncio.Event()

    def _signal_handler(*_):
        shutdown_event.set()

    loop = asyncio.get_event_loop()
    signal.signal(signal.SIGINT, _signal_handler)
    signal.signal(signal.SIGTERM, _signal_handler)

    config = Config()
    config.bind = ["localhost:80"]  # As an example configuration setting

    loop.run_until_complete(
        serve(app, config, shutdown_trigger=shutdown_event.wait)
    )

