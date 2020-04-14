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
        self.f0 = interp.bisplrep(lat, lon, x)
        self.f1 = interp.bisplrep(lat, lon, z)

        self.g0 = interp.bisplrep(x, z, lat)
        self.g1 = interp.bisplrep(x, z, lon)

    def lat_lon_to_xz(self, lat, lon):
        return interp.bisplev(lat, lon, self.f0), interp.bisplev(lat, lon, self.f1)

    def xz_to_lat_lon(self, x, z):
        return interp.bisplev(x, z, self.g0), interp.bisplev(x, z, self.g1)


_instance = CoordInterpolator()
