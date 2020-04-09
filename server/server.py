from flask import Flask, render_template, send_from_directory, make_response, jsonify, abort
from waitress import serve
from unit_sidc import sidc_map

from util import fixup_jsonlike

from coord import xz_to_lat_lon


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
    app = Flask(__name__, static_folder='static',
                template_folder='static')

    @app.route('/', defaults={'path': 'map.html'})
    @app.route('/static/<path:path>')
    def send_static(path):
        return send_from_directory('static', path)

    def validate_coalition(c):
        if not c in campaign.mission.coalition:
            abort(404)

    @app.route('/game/plane_groups/<string:coalition>')
    def render_plane_groups(coalition):
        validate_coalition(coalition)
        groups = campaign.get_plane_groups(side=coalition)

        def render_plane_group(g):
            unit_data = collect_basic_unit_info(g)
            unit_data['callsign'] = g.units[0].callsign_dict['name'][:-1]
            return unit_data

        return jsonify([render_plane_group(g) for g in groups])

    @app.route('/game/ships/<string:coalition>')
    def render_ship_groups(coalition):
        validate_coalition(coalition)
        groups = campaign.get_ship_groups(side=coalition)
        return jsonify([collect_basic_unit_info(g) for g in groups])

    return app


def run(campaign, port=80):
    app = create_app(campaign)
    serve(app, port=port)
