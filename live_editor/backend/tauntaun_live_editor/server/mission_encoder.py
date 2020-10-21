import inspect
import json

from dcs import Mission, Point
from dcs.coalition import Coalition
from dcs.country import Country
from dcs.flyingunit import FlyingUnit
from dcs.planes import PlaneType
from dcs.point import StaticPoint, PointAction, MovingPoint
from dcs.terrain import Terrain, Airport
from dcs.translation import String
from dcs.unit import Unit
from dcs.unitgroup import Group

from tauntaun_live_editor.coord import xz_to_lat_lon

from datetime import datetime

class MissionEncoder(json.JSONEncoder):
    def __init__(self, terrain, convert_coords=False, add_sidc=False, *args, **kws):
        self.dcs_terrain = terrain
        self.convert_coords = convert_coords
        self.add_sidc = add_sidc
        super().__init__(*args, **kws)

    def boolean(self, obj):
        return 'true' if obj else 'false'

    def mission(self, obj):
        return {
            'terrain': self.default(obj.terrain),
            'coalition': self.default(obj.coalition),
            'start_time': self.default(obj.start_time)
        }

    def coalition(self, obj):
        return {
            'name': obj.name,
            'countries':  self.default(obj.countries)
        }

    def country(self, obj):
        return {
            'id': obj.id,
            'name': obj.name,
            'vehicle_group': self.default(obj.vehicle_group),
            'ship_group': self.default(obj.ship_group),
            'plane_group': self.default(obj.plane_group),
            'helicopter_group': self.default(obj.helicopter_group),
            'static_group': self.default(obj.static_group),
            'planes': self.default(obj.planes)
        }

    def group(self, obj):
        result = {
            'id': obj.id,
            'name': self.default(obj.name),
            'units': self.default(obj.units),
            'points': self.default(obj.points),
            'hidden': self.default(obj.hidden) if obj.hidden is not None else 'false'
        }

        if hasattr(obj, 'task'):
            result['task'] = obj.task
        else:
            result['task'] = ''

        return result

    def flying_unit(self, obj):
        result = {
            **self.unit(obj),
            'flare': obj.flare,
            'chaff': obj.chaff,
            'fuel': obj.fuel,
            'gun': obj.gun,
            'pylons': obj.pylons,
            'radio': obj.radio if obj.radio is not None else "",
            'hardpoint_racks': obj.hardpoint_racks
        }

        return result


    def unit(self, obj):
        result = {
            'id': obj.id,
            'type': obj.type,
            'name': self.default(obj.name),
            'position': self.default(obj.position),
            'skill': str(obj.skill)
        }

        return result

    def static_point(self, obj):
        return {
            'alt': obj.alt,
            'type': obj.type,
            'name': obj.name,
            'position': self.default(obj.position),
            'speed': obj.speed,
            'action': obj.action
        }

    def moving_point(self, obj):
        return {
            **self.static_point(obj),
            'alt_type': obj.alt_type
        }

    def point(self, obj):
        if self.convert_coords:
            lat, lon = xz_to_lat_lon(self.dcs_terrain.name, obj.x, obj.y)
            return {'lat': lat, 'lon': lon}

        return {'x': obj.x, 'y': obj.y}

    def translation_string(self, obj):
        lang = "DEFAULT"
        if obj.translation is not None and obj.id in obj.translation.strings[lang]:
            return obj.str(lang)
        else:
            # TODO possible missing data, introduced in pydcs 0.9.9
            return ""

    def point_action(self, obj):
        return str(obj).replace('PointAction.', '')

    def terrain(self, obj):
        return {
            'name': obj.name,
            'airports': self.default(obj.airports),
            'center': {'lat': obj.center['lat'], 'lon': obj.center['long']},
            'map_view_default': self.default(obj.map_view_default.position)
        }

    def airport(self, obj):
        return {
            'id': obj.id,
            'name': obj.name,
            'position': self.default(obj.position),
            'coalition': obj.coalition,
        }

    def plane_type(self, obj):
        return {
            'id': obj.id
        }

    def datetime(self, obj):
        return obj.strftime("%Y-%m-%d %H:%M:%S")

    def default(self, obj):
        if isinstance(obj, dict):
            return {k: self.default(v) for k, v in obj.items()}

        if isinstance(obj, list):
            return [self.default(v) for v in obj]

        if isinstance(obj, bool):
            return self.boolean(obj)

        if isinstance(obj, datetime):
            return self.datetime(obj)

        if isinstance(obj, Mission):
            return self.mission(obj)

        if isinstance(obj, Coalition):
            return self.coalition(obj)

        if isinstance(obj, Country):
            return self.country(obj)

        if isinstance(obj, Group):
            return self.group(obj)

        if isinstance(obj, FlyingUnit):
            return self.flying_unit(obj)

        if isinstance(obj, Unit):
            return self.unit(obj)

        if isinstance(obj, MovingPoint):
            return self.moving_point(obj)

        if isinstance(obj, StaticPoint):
            return self.static_point(obj)

        if isinstance(obj, Point):
            return self.point(obj)

        if isinstance(obj, String):
            return self.translation_string(obj)

        if isinstance(obj, PointAction):
            return self.point_action(obj)

        if isinstance(obj, Terrain):
            return self.terrain(obj)

        if isinstance(obj, Airport):
            return self.airport(obj)

        if inspect.isclass(obj) and issubclass(obj, PlaneType):
            return self.plane_type(obj)

        return json.JSONEncoder.default(self, obj)
