import os
import sys

sys.path.append(
    f"{os.path.dirname(os.path.realpath(__file__))}/../tauntaun_live_editor/dcs"
)

import dcs
from dcs.mapping import Vector2
from dcs import Mission

from tauntaun_live_editor.camp import Campaign


def create_mission() -> Mission:
    m = dcs.Mission(dcs.terrain.Caucasus())

    batumi = m.terrain.batumi()
    batumi.set_blue()

    usa = m.country("USA")
    batumi_pos = batumi.position
    batumi_offset_pos = batumi_pos + Vector2(20000, 80000)
    awacs = m.awacs_flight(usa,
                           "AWACS",
                           dcs.planes.E_3A,
                           batumi,
                           batumi_offset_pos,
                           race_distance=120 * 1000,
                           heading=90)

    escort = m.escort_flight(usa, "Escort", dcs.planes.F_A_18C, batumi, awacs)
    escort.load_pylon(dcs.planes.F_A_18C.Pylon2.Mk_82___500lb_GP_Bomb_LD, 2)

    return m


def create_campaign() -> Campaign:
    campaign = Campaign()
    campaign.mission = create_mission()

    return campaign
