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

    def test_nevada(self):
        terrain = 'Nevada'

        self.assert_coords(terrain, -166934.953125, -286201.13375, 38.331229127811, -118.05494377297)
        self.assert_coords(terrain, -232983.49375, -253850.8278125, 37.738731501767, -117.67932232172)
        self.assert_coords(terrain, -345266.0128125, -22006.96859375, 36.712987304007, -115.07432848096)
        self.assert_coords(terrain, -404709.699375, 102002.5375, 36.147446206482, -113.71019393401)
        self.assert_coords(terrain, -483967.948125, 75043.94921875, 35.441655894072, -114.03608205541)

    def test_normandy(self):
        terrain = 'Normandy'

        self.assert_coords(terrain, 74967, -107645.42, 50.183692938443, -1.7690529516871)
        self.assert_coords(terrain, 19630.77, 7498, 49.658330493149, -0.1868261348334)
        self.assert_coords(terrain, 3234.85, 2598.28, 49.512651871003, -0.2628951911186)
        self.assert_coords(terrain, -21359.03, 17297.44 ,49.286740747004, -0.073266016499883)
        self.assert_coords(terrain, -74645.77, -48848.78, 48.827151431021, -1.0014909473753)
        self.assert_coords(terrain, -115635.57, -19450.46, 48.451084027503, -0.61868165746491)

    def test_syria(self):
        terrain = 'Syria'

        self.assert_coords(terrain, -320000, -463987.6, 31.929026077774, 31.110865657371)
        self.assert_coords(terrain, -220800, -301589.84, 32.913699977322, 32.755371420731)
        self.assert_coords(terrain, -41000, -487187.28, 34.404109018683, 30.632999467916)
        self.assert_coords(terrain, 33400, -162391.76, 35.263605017125, 34.107511304999)
        self.assert_coords(terrain, 194600, -533586.64, 36.466937119472, 29.899096794585)
        self.assert_coords(terrain, 293800, 498799.12, 37.684786957526, 41.44955141892)


if __name__ == '__main__':
    unittest.main()
