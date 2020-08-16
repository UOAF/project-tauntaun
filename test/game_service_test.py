import unittest

from test.test_common import create_campaign


class GameServiceTestCase(unittest.TestCase):
    def test_update_unit_loadout(self):
        campaign = create_campaign()

        campaign.game_service.update_unit_loadout(2,
                                                  {'1': '{AIS_ASQ_T50}'},
                                                  20,
                                                  30,
                                                  90,
                                                  4000)

        unit = next(u for u in campaign.get_plane_group_units('blue') if u.id == 2)
        self.assertEqual(unit.pylons, {1: {'CLSID': '{AIS_ASQ_T50}'}})
        self.assertEqual(unit.chaff, 20)
        self.assertEqual(unit.flare, 30)
        self.assertEqual(unit.gun, 90)
        self.assertEqual(unit.fuel, 4000)


if __name__ == '__main__':
    unittest.main()
