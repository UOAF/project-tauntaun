import os
import sys
sys.path.append(f"{os.path.dirname(os.path.realpath(__file__))}/../tauntaun_live_editor/dcs")

import dcs
from dcs import Mission

from tauntaun_live_editor.camp import Campaign


def create_mission() -> Mission:
    m = dcs.Mission(dcs.terrain.Caucasus())

    batumi = m.terrain.batumi()
    batumi.set_blue()

    usa = m.country("USA")
    awacs = m.awacs_flight(
        usa, "AWACS", dcs.planes.E_3A,
        batumi, dcs.Point(batumi.position.x + 20000, batumi.position.y + 80000),
        race_distance=120 * 1000, heading=90)

    escort = m.escort_flight(
        usa, "Escort", dcs.planes.F_A_18C,
        batumi, awacs)
    escort.load_pylon(dcs.planes.F_A_18C.Pylon2.Mk_82, 2)

    return m

def create_campaign() -> Campaign:
    campaign = Campaign()
    campaign.mission = create_mission()

    return campaign