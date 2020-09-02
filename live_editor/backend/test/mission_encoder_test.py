import json
import unittest

from server.mission_encoder import MissionEncoder
from test.test_common import create_mission


class MissionEncoderTestCase(unittest.TestCase):
     def test_to_json_no_exception(self):
        mission = create_mission()

        json.dumps(mission, terrain=mission.terrain,  convert_coords=True, add_sidc=True, cls=MissionEncoder)
        self.assertEqual(True, True)

if __name__ == '__main__':
    unittest.main()
