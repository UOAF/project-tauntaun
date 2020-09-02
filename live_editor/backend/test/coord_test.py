import unittest

from live_editor.backend.coord import xz_to_lat_lon, lat_lon_to_xz


class CoordTestCase(unittest.TestCase):
    threshold_latlon = 1e-06
    threshold_xz = 1

    def assert_coords(self, terrain, x, z, lat, lon):
        latlon = xz_to_lat_lon(terrain, x, z)
        err_lat = abs(latlon[0] - lat)
        err_lon = abs(latlon[1] - lon)
        max_err_latlon = max(err_lat, err_lon)

        self.assertLess(max_err_latlon, self.threshold_latlon)

        xz = lat_lon_to_xz(terrain, lat, lon)
        err_x = abs(xz[0] - x)
        err_z = abs(xz[1] - z)
        max_err_xz = max(err_x, err_z)

        self.assertLess(max_err_xz, self.threshold_xz)

    def test_caucasus(self):
        terrain = 'Caucasus'

        self.assert_coords(terrain, 380000, -255800, 48.536661554102, 30.882817967736)
        self.assert_coords(terrain, 262400, 234300, 47.412581816631, 37.425398120899)
        self.assert_coords(terrain, -61000, 589200, 44.260321258372, 41.627292428947)
        self.assert_coords(terrain, -315800, -391000, 42.238620792021, 29.46741227054)
        self.assert_coords(terrain, -570600, -272700, 39.98006899309, 30.971802930894)

    def test_pg(self):
        terrain = 'PersianGulf'

        self.assert_coords(terrain, -216688.11671875, -286926.3334375, 24.175117780699, 53.43088707633)
        self.assert_coords(terrain,-154269.11828125, -373951.6609375, 24.714752137124, 52.55659374302)
        self.assert_coords(terrain, -12786.05515625, 133696.0828125, 26.057199023946, 57.579225815852)
        self.assert_coords(terrain, 62116.74296875, -18598.2403125, 26.731512389352, 56.051262818091)
        self.assert_coords(terrain, 191116.00640625, 235225.6315625 ,27.889791973869, 58.620135549782)

if __name__ == '__main__':
    unittest.main()
