import os
import os.path
import itertools
import argparse
import pkg_resources # pyinstaller

import sys
sys.path.append(f"{os.path.dirname(os.path.realpath(__file__))}/dcs")

import dcs
from dcs.flyingunit import FlyingUnit
from dcs.point import PointAction, MovingPoint
from dcs.translation import String
from dcs.unit import Skill
from dcs.weapons_data import weapon_ids
from dcs import terrain
from dcs.terrain.terrain import NoParkingSlotError
import dcs.mapping as mapping


import tauntaun_live_editor.server as server
import tauntaun_live_editor.config as config
from tauntaun_live_editor.util import get_dcs_dir, get_data_path, is_posix, Timer
from tauntaun_live_editor.coord import lat_lon_to_xz
from tauntaun_live_editor.sessions import SessionManager

_data_dir = get_data_path()
_build_in_default_mission = os.path.join(_data_dir, 'Missions/default.miz')

def _get_miz_path(name='tauntaun'):
    if is_posix():
        dcs_dir = _data_dir
    else:
        dcs_dir = get_dcs_dir()
        if not dcs_dir:
            print("No DCS dir found. Not saving")
            return

    return os.path.join(dcs_dir, "Missions", name + ".miz")

def _convert_point(terrain, p):
    lat = float(p['lat'])
    lon = float(p['lon'])
    x, z = lat_lon_to_xz(terrain.name, lat, lon)
    return mapping.Point(x, z)

class GameService:
    def __init__(self, campaign):
        self.campaign: Campaign = campaign                
        self.group_route_request_handler = GameService.GroupRouteRequestHandler(campaign)

    def add_flight(self, coalition, countryName, location, airport, plane, number_of_planes):
        print("add_flight", location, airport, plane, number_of_planes)

        # TODO validate values

        location = _convert_point(self.campaign.mission.terrain, location)
        country = self.campaign.get_countries(coalition)[countryName]

        airport = self.campaign.mission.terrain.airport_by_id(airport)
        if not airport:
            print("add_flight airport not found")
            return

        planeFinder = (p for p in country.planes if p.id == plane)
        try:
            plane = next(iter(planeFinder))
        except StopIteration:
            print("add_flight plane not found")
            return

        try:
            new_flight = self.campaign.mission.flight_group_from_airport(country,
                                                                         'DefaultName',
                                                                         aircraft_type=plane,
                                                                         airport=airport,
                                                                         group_size=number_of_planes)
        except NoParkingSlotError as e:
            print(f"add_flight failed error: {e}")
            return

        new_flight.add_waypoint(location, altitude=5000)
        new_flight.set_skill(Skill.Client)

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

        return unit

    def set_bullseye(self, coalition, bullseye):
        coalitions = self.campaign.mission.coalition
        if coalition not in coalitions:
            print(f"set_bullseye failed, invalid coalition {coalition}")

        converted_point = _convert_point(self.campaign.mission.terrain, bullseye)
        coalitions[coalition].bullseye = {'x': converted_point.x, 'y': converted_point.y}
        print(f"Bullseye set {bullseye} for {coalition}")

        return coalitions[coalition].bullseye

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

            converted_wp = _convert_point(self.campaign.mission.terrain, wp)
            wp_index = [u_index for u_index, u in enumerate(group.points) if self._is_same_point(u.position, converted_wp)]

            if wp_index:
                print("Removing waypoint", wp_index)
                group.points.pop(wp_index[0])
            else:
                print("Failed to remove waypoint")

            return group

        def insert_at(self, group_id, new_wp, at_wp):
            group = self.campaign.lookup_group(group_id)            
            if group is None:
                raise ValueError(f"no group found with id {group_id}")

            converted_at_wp = _convert_point(self.campaign.mission.terrain, at_wp)
            at_index = [u_index for u_index, u in enumerate(group.points) if self._is_same_point(u.position, converted_at_wp)]

            if at_index:
                converted_new_wp = _convert_point(self.campaign.mission.terrain, new_wp)
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

            return group

        def _get_next_wp_key(self):
            wpt_key = "DictKey_WptName_"
            new_wpt_key = "DictKey_WptName_0"  # TODO
            mission_translation = self.campaign.mission.translation
            lang = "DEFAULT"
            if lang in mission_translation.strings:
                lang_translations = mission_translation.strings[lang]
                wptkeys = [key for key in lang_translations.keys() if key.startswith(wpt_key)]
                if wptkeys:
                    wptkey_numbers = [int(key.split('_')[-1]) for key in wptkeys]
                    wptkey_numbers.sort()
                    last_wp_number = wptkey_numbers[-1]
                    next_wp_number = last_wp_number + 1
                    new_wpt_key = '{}{}'.format(wpt_key, next_wp_number)

            return new_wpt_key

        def modify(self, group_id, old_wp, new_wp):
            group = self.campaign.lookup_group(group_id)
            if group is None:
                raise ValueError(f"no group found with id {group_id}")

            converted_old_wp = _convert_point(self.campaign.mission.terrain, old_wp)
            old_wp_index = [u_index for u_index, u in enumerate(group.points) if self._is_same_point(u.position, converted_old_wp)]

            if old_wp_index:
                print("Waypoint", old_wp_index, "modified")
                wp = group.points[old_wp_index[0]]
                wp.alt = new_wp['alt']
                wp.type = new_wp['type']
                if wp.name is None or wp.name.translation is None or not isinstance(wp.name, String):
                    wp.name = String(self._get_next_wp_key(), self.campaign.mission.translation)
                wp.name.set(new_wp['name'])
                wp.position = _convert_point(self.campaign.mission.terrain, new_wp['position'])
                wp.speed = new_wp['speed']
                wp.action = PointAction[new_wp['action']]
                if isinstance(wp, MovingPoint):
                    wp.alt_type = new_wp['alt_type']
            else:
                print("Failed to modify waypoint")

            return group

class Campaign():
    def __init__(self):
        self.mission: dcs.Mission = None
        self.game_service = GameService(self)
        self.autosave_timer = Timer(15, self.create_autosave_callback(), True)

    def create_autosave_callback(self):
        async def autosave_callback():
            self.save_mission()
            print("Autosave: mission saved.")

        return autosave_callback

    def get_countries(self, side):
        return self.mission.coalition[side].countries

    def get_plane_groups(self, side):
        countries = self.get_countries(side)
        return itertools.chain(*(countries[cname].plane_group for cname in countries))

    def get_plane_group_units(self, side):
        return itertools.chain(*(group.units for group in self.get_plane_groups(side)))

    def get_airport(self, name):
        return self.mission.terrain.airport[name]

    def get_ship_groups(self, side):
        countries = self.get_countries(side)
        return itertools.chain(*(countries[cname].ship_group for cname in countries))

    def lookup_unit(self, unit_id):
        # TODO
        for unit in self.get_plane_group_units('blue'):
            if unit_id == unit.id:
                return unit

        for unit in self.get_plane_group_units('red'):
            if unit_id == unit.id:
                return unit

    def lookup_group(self, group_id):

        # TODO
        for group in self.get_plane_groups('blue'):
            if group_id == group.id:
                return group

        for group in self.get_ship_groups('blue'):
            if group_id == group.id:
                return group

        for group in self.get_plane_groups('red'):
            if group_id == group.id:
                return group

        for group in self.get_ship_groups('red'):
            if group_id == group.id:
                return group

    def update_unit_route(self, unit_id, points):
        group = self.lookup_group(unit_id)
        if group is None:
            raise ValueError(f"no group found with id {unit_id}")
        for point, new_pos in zip(group.points, points):
            lat = float(new_pos['lat'])
            lon = float(new_pos['lon'])
            x, z = lat_lon_to_xz(self.mission.terrain.name, lat, lon)
            point.position = mapping.Point(x, z)

    def save_mission(self):
        mizname = _get_miz_path(config.config.mission_save_filename)

        self.mission.save(mizname)

        print("Mission saved to", mizname)

    def load_mission(self, filename=None):
        if self.autosave_timer.is_running():
            self.autosave_timer.cancel()

        mizname = filename
        if filename is None:
            mizname = _get_miz_path(config.config.mission_load_filename)

        if not os.path.isfile(mizname):
            print("Unable to load mission file not found ", mizname)
            return

        self.mission.load_file(mizname, True)
        print("Mission loaded from", mizname)

        if _build_in_default_mission != mizname:
            if config.config.autosave:
                print("Autosave enabled: starting timer.")
                self.autosave_timer.start()


def save_mission(m, name='pytest'):
    if is_posix:
        dcs_dir = _data_dir
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
    parser = argparse.ArgumentParser(description='Tauntaun live editor server.')
    parser.add_argument('--config', help="path to config.json", type=str)

    args = parser.parse_args()

    config_path = None
    if args.config is not None:
        config_path = args.config

    config.load_config(config_path)

    c = Campaign()
    c.mission = dcs.Mission(terrain.Caucasus())
    session_manager = SessionManager()

    if config.config.default_mission:
        print("Using default mission set in config")
        defualt_miz_path = _get_miz_path(config.config.default_mission)
    else:
        defualt_miz_path = _build_in_default_mission

    if os.path.isfile(defualt_miz_path):
        c.load_mission(defualt_miz_path)
    else:
        print("Unable to load default mission, using empty mission!")
        batumi = c.mission.terrain.batumi()
        batumi.set_blue()

    server.run(c, session_manager, 8080)

if __name__ == '__main__':
    main()
