import numpy as np
import scipy.interpolate as interp


def lat_lon_to_xz(lat, lon):
    return _instance.lat_lon_to_xz(lat, lon)

def xz_to_lat_lon(x, z):
    return _instance.xz_to_lat_lon(x, z)

class CoordInterpolator(object):
    def __init__(self, fname='data/coords.npy'):
        coord_table = np.load('data/coords.npy')
        self.t = t = coord_table
        lat, lon, x, z = t
        self.f0 = interp.RectBivariateSpline(lat[::1001], lon[:1001], x.reshape(601, 1001))
        self.f1 = interp.RectBivariateSpline(lat[::1001], lon[:1001], z.reshape(601, 1001))

        self.g0 = interp.RectBivariateSpline(x[::1001], z[:1001], lat.reshape(601, 1001))
        self.g1 = interp.RectBivariateSpline(x[::1001], z[:1001], lon.reshape(601, 1001))
        

    def lat_lon_to_xz(self, lat, lon):
        return self.f0(lat, lon)[0][0], self.f1(lat, lon)[0][0]

    def xz_to_lat_lon(self, x, z):
        return self.g0(x, z)[0][0], self.g1(x, z)[0][0]

_instance = CoordInterpolator()
