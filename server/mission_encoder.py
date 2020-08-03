import json

from dcs import Mission, Point
from dcs.coalition import Coalition
from dcs.country import Country
from dcs.planes import PlaneType
from dcs.point import StaticPoint, PointAction
from dcs.terrain import Terrain, Airport
from dcs.translation import String
from dcs.unit import Unit
from dcs.unitgroup import Group

from coord import xz_to_lat_lon
from unit_sidc import sidc_map

class MissionEncoder(json.JSONEncoder):
    def __init__(self, convert_coords=False, add_sidc=False, *args, **kws):
        self.convert_coords = convert_coords
        self.add_sidc = add_sidc
        super().__init__(*args, **kws)

    def mission(self, obj):
        return {
            'terrain': self.default(obj.terrain),
            'coalition': self.default(obj.coalition)
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
        return {
            'id': obj.id,
            'units': self.default(obj.units),
            'points': self.default(obj.points),
            'name': self.default(obj.name)
        }

    def unit(self, obj):
        result = {
            'id': obj.id,
            'type': obj.type,
            'name': self.default(obj.name),
            'position': self.default(obj.position)
        }

        if self.add_sidc:
            try:
                result['sidc'] = sidc_map[obj.type]
            except KeyError:
                result['sidc'] = 'SFAPMFF---*****1' # TODO default for now

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

    def point(self, obj):
        if self.convert_coords:
            lat, lon = xz_to_lat_lon(obj.x, obj.y)
            return {'lat': lat, 'lon': lon}

        return {'x': obj.x, 'y': obj.y}

    def translation_string(self, obj):
        return str(obj)

    def point_action(self, obj):
        return str(obj)

    def terrain(self, obj):
        return {
            'name': obj.name,
            'airports': self.default(obj.airports)
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

    def default(self, obj):
        if isinstance(obj, dict):
            return {k: self.default(v) for k, v in obj.items()}

        if isinstance(obj, list):
            return [self.default(v) for v in obj]

        if isinstance(obj, Mission):
            return self.mission(obj)

        if isinstance(obj, Coalition):
            return self.coalition(obj)

        if isinstance(obj, Country):
            return self.country(obj)

        if isinstance(obj, Group):
            return self.group(obj)

        if isinstance(obj, Unit):
            return self.unit(obj)

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

        if issubclass(obj, PlaneType):
            return self.plane_type(obj)

        return json.JSONEncoder.default(self, obj)
