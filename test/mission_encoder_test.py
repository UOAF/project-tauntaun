import json
import unittest

import dcs

from server.mission_encoder import MissionEncoder


class MissionEditorTestCase(unittest.TestCase):
    def create_mission(self):
        m = dcs.Mission(dcs.terrain.Caucasus())

        batumi = m.terrain.batumi()
        batumi.set_blue()

        usa = m.country("USA")
        m.awacs_flight(
            usa, "AWACS", dcs.planes.E_3A,
            batumi, dcs.Point(batumi.position.x + 20000, batumi.position.y + 80000),
            race_distance=120 * 1000, heading=90)

        return m

    def test_to_json_no_exception(self):
        mission = self.create_mission()

        print(json.dumps(mission, convert_coords=True, add_sidc=True, cls=MissionEncoder))
        self.assertEqual(True, True)

if __name__ == '__main__':
    unittest.main()
