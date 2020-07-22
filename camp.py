from util import get_dcs_dir, point_along_route
from dcs import mission, terrain
from dcs.mission import StartType
from dcs import ships, planes
from dcs.task import ActivateBeaconCommand, ActivateICLSCommand, EPLRS
import dcs
import dcs.mapping as mapping
import os
import os.path
from dataclasses import dataclass
from namegen import namegen
from random import random
import server
import itertools
from coord import lat_lon_to_xz
from util import feet_to_meters, knots_to_kph

from enum import Enum
from templates import make_sa2_site


class Coalition(Enum):
    NEUTRAL = 'NEWTRAL'
    RED = 'RED'
    BLUE = 'BLUE'


@dataclass
class Airport():
    name: str
    airport_pydcs: dcs.terrain.Airport
    coalition: Coalition


class Campaign():
    def __init__(self, terrain=dcs.terrain.Caucasus, savefile=None):
        self.terrain = terrain()
        if savefile is None:
            self.init_fresh_campaign()

    def init_fresh_campaign(self):
        # For each pydcs airport, create one in the campaign model
        def make_airport(airport_pydcs):
            a = airport_pydcs
            return Airport(name=a.name,
                           airport_pydcs=airport_pydcs,
                           coalition=Coalition.RED)
        self.airports = {name: make_airport(a) for
                         name, a in self.terrain.airports.items()}

    def get_countries(self, side):
        return self.mission.coalition[side].countries

    def get_plane_groups(self, side):
        countries = self.get_countries(side)
        return itertools.chain(*(countries[cname].plane_group for cname in countries))

    def get_airport(self, name):
        return self.airports[name]

    def get_ship_groups(self, side):
        countries = self.get_countries(side)
        return itertools.chain(*(countries[cname].ship_group for cname in countries))

    def lookup_unit(self, unit_id):
        for group in self.get_plane_groups('blue'):
            if unit_id == group.id:
                return group

        for group in self.get_ship_groups('blue'):
            if unit_id == group.id:
                return group

    def update_unit_route(self, unit_id, points):
        def convert_point(p):
            lat = float(p['lat'])
            lon = float(p['lon'])
            x, z = lat_lon_to_xz(lat, lon)
            return mapping.Point(x, z)
        
        def is_same_point(a, b):
            # For now the position uniquely identifies the waypoint
            coord_drift_threshold = 1  # meter
            return a.distance_to_point(b) < coord_drift_threshold
        
        group = self.lookup_unit(unit_id)
        if group is None:
            raise ValueError(f"no group found with id {unit_id}")

        converted_points = [convert_point(p) for p in points]

        id_map = {}
        for index, new_pos in enumerate(converted_points):
            id_map[index] = [u_index for u_index, u in enumerate(group.points) if is_same_point(u.position, new_pos)]

        reverse_id_map = {}
        for index, unit_pos in enumerate(group.points):
            reverse_id_map[index] = [p_index for p_index, p in enumerate(converted_points) if is_same_point(unit_pos.position, p)]

        id_map_not_found = [_ for _ in filter(lambda a: not id_map[a], id_map)]
        id_map_not_found_count = len(id_map_not_found)
        reverse_id_map_not_found = [_ for _ in filter(lambda a: not reverse_id_map[a], reverse_id_map)]
        reverse_id_map_not_found_count = len(reverse_id_map_not_found)

        # No change in positions
        if id_map_not_found_count == reverse_id_map_not_found_count and id_map_not_found_count == 0 \
                and id_map == reverse_id_map:
            print("Waypoint positions not changed, not implemented.") # TODO
            return

        # Point position modified
        if id_map_not_found_count == reverse_id_map_not_found_count and id_map_not_found_count == 1\
                and id_map == reverse_id_map:
            wp_index = next(iter(id_map_not_found))
            print("Waypoint position", wp_index, "changed")
            group.points[wp_index].position = converted_points[wp_index]
            return

        # Point inserted
        if reverse_id_map_not_found_count == 0 and id_map_not_found_count == 1:
            wp_index = next(iter(id_map_not_found))
            print("New waypoint added at position ", wp_index)
            wp = group.add_waypoint(converted_points[wp_index])
            group.points.pop()
            group.points.insert(wp_index, wp)
            return

        # Point removed
        # TODO

        print("Invalid change, dropping request!")


def create_mission(campaign):
    m = dcs.Mission(terrain.Caucasus())
    # setup airports
    for name, airport in campaign.airports.items():
        coal_name = airport.coalition.value
        print(coal_name)
        assert(m.terrain.airports[name].set_coalition(coal_name))

    usa = m.country("USA")
    russia = m.country("Russia")
    sochi = m.terrain.sochi_adler()
    ship_pos = sochi.position - dcs.Point(50000, 50000)
    print(f"{sochi.position=}")
    print(f"{ship_pos=}")
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
    dcs_dir = get_dcs_dir()
    if not dcs_dir:
        print("No DCS dir found. Not saving")
        return

    mizname = os.path.join(dcs_dir, "Missions", "pytest.miz")
    m.save(mizname)
    from zipfile import ZipFile
    with ZipFile(mizname) as miz:
        miz.extract('mission')
    if os.path.exists('mission.lua'):
        os.remove('mission.lua')
    os.rename('mission', 'mission.lua')


def main():
    c = Campaign()
    m = create_mission(c)
    save_mission(m)
    server.run(c)


if __name__ == '__main__':
    main()
