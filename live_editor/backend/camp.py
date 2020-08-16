from dcs.flyingunit import FlyingUnit
from dcs.point import PointAction
from dcs.weapons_data import Weapons, weapon_ids

from util import get_dcs_dir, point_along_route
from dcs import terrain
from dcs.mission import StartType
from dcs import ships, planes
from dcs.task import ActivateBeaconCommand, ActivateICLSCommand, EPLRS
import dcs
import dcs.mapping as mapping
import os
import os.path
from namegen import namegen
from random import random
import server
import itertools
from coord import lat_lon_to_xz
from util import feet_to_meters, knots_to_kph

from templates import make_sa2_site

def is_posix():
    return os.name == 'posix'

class GameService:
    def __init__(self, campaign):
        self.campaign: Campaign = campaign                
        self.group_route_request_handler = GameService.GroupRouteRequestHandler(campaign)

    @staticmethod
    def _convert_point(p):
        lat = float(p['lat'])
        lon = float(p['lon'])
        x, z = lat_lon_to_xz(lat, lon)
        return mapping.Point(x, z)

    def add_flight(self, location, airport, plane, number_of_planes):
        print("add_flight", location, airport, plane, number_of_planes)

        location = self._convert_point(location)
        country = self.campaign.get_countries('blue')["USA"]

        airport = self.campaign.terrain.airport_by_id(airport)
        if not airport:
            print("add_flight airport not found")
            return

        planeFinder = (p for p in country.planes if p.id == plane)
        try:
            plane = next(iter(planeFinder))
        except StopIteration:
            print("add_flight plane not found")
            return

        new_flight = self.campaign.mission.flight_group_from_airport(country,
                                                                     'DefaultName',
                                                                     aircraft_type=plane,
                                                                     airport=airport,
                                                                     group_size=number_of_planes)
        new_flight.add_waypoint(location, altitude=5000)

        print("add_flight", "success")

    def update_unit_loadout(self, unit_id, pylons, chaff, flare, gun, fuel):
        print("update_unit_loadout", unit_id, pylons, chaff, flare, gun, fuel)

        # TODO Add proper validation as this function will "hard overwrite"
        # unit attributes and can corrupt the mission file
        # ("good enough for mvp" :tm:)

        unit: FlyingUnit = self.campaign.lookup_unit(unit_id)

        mapped_pylons = {}
        for k in pylons:
            clsid = weapon_ids[pylons[k]]['clsid']
            assert(clsid is not None)
            mapped_pylons[int(k)] = {
                'CLSID': clsid
           }
        unit.pylons = mapped_pylons

        # TODO validate chaff/flare
        unit.chaff = chaff
        unit.flare = flare
        assert(0 <= gun <= 100)
        unit.gun = gun
        # TODO validate fuel
        unit.fuel = fuel

        print("update_unit_loadout", "success")

    class GroupRouteRequestHandler:
        def __init__(self, campaign):
            self.campaign = campaign

        @staticmethod
        def _is_same_point(a, b):
            # For now the position uniquely identifies the waypoint
            coord_drift_threshold = 1  # meter
            return a.distance_to_point(b) < coord_drift_threshold

        def remove(self, group_id, wp):
            group = self.campaign.lookup_group(group_id)
            if group is None:
                raise ValueError(f"no group found with id {group_id}")

            converted_wp = GameService._convert_point(wp)
            wp_index = [u_index for u_index, u in enumerate(group.points) if self._is_same_point(u.position, converted_wp)]

            if wp_index:
                print("Removing waypoint", wp_index)
                group.points.pop(wp_index[0])
            else:
                print("Failed to remove waypoint")

        def insert_at(self, group_id, new_wp, at_wp):
            group = self.campaign.lookup_group(group_id)            
            if group is None:
                raise ValueError(f"no group found with id {group_id}")

            converted_at_wp = GameService._convert_point(at_wp)
            at_index = [u_index for u_index, u in enumerate(group.points) if self._is_same_point(u.position, converted_at_wp)]

            if at_index:
                converted_new_wp = GameService._convert_point(new_wp)
                print("New waypoint added at position", at_index)
                at_index = at_index[0]
                if issubclass(group.__class__, dcs.unitgroup.FlyingGroup):
                    prev_waypoints_altitude = group.points[at_index - 1].alt
                    wp = group.add_waypoint(converted_new_wp, altitude=prev_waypoints_altitude)
                else:
                    wp = group.add_waypoint(converted_new_wp)
                group.points.pop()
                group.points.insert(at_index, wp)
            else:
                print("Failed to add new waypoint")

        def modify(self, group_id, old_wp, new_wp):
            group = self.campaign.lookup_group(group_id)
            if group is None:
                raise ValueError(f"no group found with id {group_id}")

            converted_old_wp = GameService._convert_point(old_wp)
            old_wp_index = [u_index for u_index, u in enumerate(group.points) if self._is_same_point(u.position, converted_old_wp)]

            if old_wp_index:
                print("Waypoint", old_wp_index, "modified")
                wp = group.points[old_wp_index[0]]
                wp.alt = new_wp['alt']
                wp.type = new_wp['type']
                #wp.name.set(new_wp['name']) # TODO Missing translation, ignore name for now
                wp.position = GameService._convert_point(new_wp['position'])
                wp.speed = new_wp['speed']
                wp.action = PointAction[new_wp['action']]
            else:
                print("Failed to modify waypoint")

class Campaign():
    def __init__(self, terrain=dcs.terrain.Caucasus):
        self.terrain = terrain()
        self.mission: dcs.Mission = None
        self.game_service = GameService(self)

    def get_countries(self, side):
        return self.mission.coalition[side].countries

    def get_plane_groups(self, side):
        countries = self.get_countries(side)
        return itertools.chain(*(countries[cname].plane_group for cname in countries))

    def get_plane_group_units(self, side):
        return itertools.chain(*(group.units for group in self.get_plane_groups(side)))

    def get_airport(self, name):
        return self.terrain.airport[name]

    def get_ship_groups(self, side):
        countries = self.get_countries(side)
        return itertools.chain(*(countries[cname].ship_group for cname in countries))

    def lookup_unit(self, unit_id):
        for unit in self.get_plane_group_units('blue'):
            if unit_id == unit.id:
                return unit

    def lookup_group(self, group_id):
        for group in self.get_plane_groups('blue'):
            if group_id == group.id:
                return group

        for group in self.get_ship_groups('blue'):
            if group_id == group.id:
                return group

    def update_unit_route(self, unit_id, points):
        group = self.lookup_group(unit_id)
        if group is None:
            raise ValueError(f"no group found with id {unit_id}")
        for point, new_pos in zip(group.points, points):
            lat = float(new_pos['lat'])
            lon = float(new_pos['lon'])
            x, z = lat_lon_to_xz(lat, lon)
            point.position = mapping.Point(x, z)

    def _get_miz_path(self, name='tauntaun'):
        dcs_dir = '.'
        if is_posix():
            if not os.path.exists('Missions'):
                os.makedirs('Missions')
        else:
            dcs_dir = get_dcs_dir()
            if not dcs_dir:
                print("No DCS dir found. Not saving")
                return

        return os.path.join(dcs_dir, "Missions", name + ".miz")

    def save_mission(self):
        mizname = self._get_miz_path()
        self.mission.save(mizname)
        print("Mission saved to", mizname)

    def load_mission(self):
        mizname = self._get_miz_path()
        self.mission.load_file(mizname)
        print("Mission loaded from", mizname)

def create_mission(campaign):
    m = dcs.Mission(terrain.Caucasus())
    # setup airports
    for name, airport in campaign.terrain.airports.items():
        coal_name = airport.coalition
        assert(m.terrain.airports[name].set_coalition(coal_name))

    usa = m.country("USA")
    russia = m.country("Russia")
    sochi = m.terrain.sochi_adler()
    sochi.set_red()
    ship_pos = sochi.position - dcs.Point(50000, 50000)
    cvbg = m.ship_group(
        country=usa,
        name="CVN 74 Stennis",
        _type=ships.CVN_74_John_C__Stennis,
        position=ship_pos)

    tasks = cvbg.points[0].tasks
    tasks.append(ActivateICLSCommand(unit_id=cvbg.id, channel=5))
    tasks.append(ActivateBeaconCommand(unit_id=cvbg.id, channel=69,
                                       callsign="STN", aa=False))
    cvbg.add_waypoint(ship_pos + dcs.Point(0, -100*1000))
    cvbg.add_waypoint(ship_pos + dcs.Point(-30*1000, -100*1000))
    cvbg.add_waypoint(ship_pos + dcs.Point(-30*1000, 0))
    # cvbg.add_waypoint(ship_pos)
    # cvbg.add_waypoint(ship_pos + dcs.Point(0, -100*1000))
    # cvbg.add_waypoint(ship_pos + dcs.Point(-30*1000, -100*1000))
    # cvbg.add_waypoint(ship_pos + dcs.Point(-30*1000, 0))
    # cvbg.add_waypoint(ship_pos)

    name = namegen.next_unit_name(usa)
    fg = m.flight_group_from_unit(country=usa,
                                  name=name,
                                  aircraft_type=planes.FA_18C_hornet,
                                  maintask=None,
                                  start_type=StartType.Warm,
                                  pad_group=cvbg,
                                  group_size=4)
    fg.load_pylon(planes.FA_18C_hornet.Pylon1.AN_ASQ_T50_TCTS_Pod, 1)
    fg.set_client()

    offset = dcs.Point(random()*1000.0, random()*1000.0)
    orientation = random()*360.
    sa2_pos = sochi.position + offset
    p = fg.add_waypoint(ship_pos + dcs.Point(1000, 3000), feet_to_meters(8000))
    pos = point_along_route(p.position, sochi.position, 50*2000)
    p = fg.add_waypoint(pos, feet_to_meters(26000))
    fg.add_waypoint(point_along_route(
        p.position, sochi.position, -1000), feet_to_meters(26000))
    fg.land_at(cvbg)

    make_sa2_site(m, russia, sa2_pos, orientation)

    awacs = m.awacs_flight(
        usa,
        "AWACS",
        planes.E_3A,
        None,
        dcs.Point(sochi.position.x + 20000, sochi.position.y + 80000),
        race_distance=80 * 1000, heading=90,
        speed=knots_to_kph(500),
        altitude=feet_to_meters(30000))
    tasks = awacs.points[0].tasks
    tasks.append(EPLRS())
    campaign.mission = m
    return m

def save_mission(m, name='pytest'):
    dcs_dir = '.'
    if is_posix:
        if not os.path.exists('Missions'):
            os.makedirs('Missions')
    else:
        dcs_dir = get_dcs_dir()
        if not dcs_dir:
            print("No DCS dir found. Not saving")
            return

    mizname = os.path.join(dcs_dir, "Missions",  name + ".miz")
    m.save(mizname)
    from zipfile import ZipFile
    with ZipFile(mizname) as miz:
        miz.extract('mission')
    if os.path.exists('mission.lua'):
        os.remove('mission.lua')
    os.rename('mission', 'mission.lua')

def main():
    c = Campaign()
    create_mission(c)
    server.run(c, 8080)

if __name__ == '__main__':
    main()
