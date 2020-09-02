import numpy as np
import sys

from live_editor.backend.coord import _CoordInterpolator, _terrain_data
from scipy.optimize import fmin

def convert_line(line):
    tokens = line.split()
    return float(tokens[0]), float(tokens[1]), float(tokens[2]), float(tokens[3])

def load_data(in_file = 'gen_grid.txt'):
    x_array = []
    z_array = []
    lat_array = []
    lon_array = []

    with open(in_file, 'r') as reader:
        for line in reader:
            x, z, lat, lon = convert_line(line)
            x_array.append(x)
            z_array.append(z)
            lat_array.append(lat)
            lon_array.append(lon)

    return np.array([x_array, z_array, lat_array,lon_array])

def opt_lat_lon_to_xz(terrain, lat, lon, arr):
    c = _terrain_data[terrain]
    c['x'] = arr[2]
    c['z'] = arr[3]
    intp = _CoordInterpolator(arr[0], arr[1])
    return intp.lat_lon_to_xz(c, lat, lon)


def opt_xz_to_lat_lon(terrain, x, z, arr):
    c = _terrain_data[terrain]
    c['x'] = arr[2]
    c['z'] = arr[3]
    intp = _CoordInterpolator(arr[0], arr[1])
    return intp.xz_to_lat_lon(c, x, z)

def calc_error(terrain, x, z, lat, lon, arr):
    latlon = opt_xz_to_lat_lon(terrain, x, z, arr)
    err_lat = abs(latlon[0] - lat)
    err_lon = abs(latlon[1] - lon)
    max_err_latlon = max(err_lat, err_lon)

    xz = opt_lat_lon_to_xz(terrain, lat, lon, arr)
    err_x = abs(xz[0] - x)
    err_z = abs(xz[1] - z)
    max_err_xz = max(err_x, err_z)

    return max_err_latlon, max_err_xz

def get_error_on_map(terrain, p_data, arr):
    max_err_latlon = 0
    max_err_xz = 0
    for i in range(len(p_data[0])):
        err_l, err_x = calc_error(terrain, p_data[0][i], p_data[1][i], p_data[2][i], p_data[3][i], arr)
        max_err_latlon = max(max_err_latlon, err_l)
        max_err_xz = max(max_err_xz, err_x)
    return max_err_xz, max_err_latlon

def get_f_map(terrain, data):
    """"
    This function return a function which calculate offsets (x,z) for the terrain based on the
    dataset.
    Format: [x, z]
    """
    def f_map(arr):
        max_err_xz, max_err_laton = get_error_on_map(terrain, data,
                                                     [_CoordInterpolator.sm_a_default,
                                                      _CoordInterpolator.sm_b_default,
                                                      arr[0],
                                                      arr[1]])

        print('step', max_err_xz, max_err_laton, arr)

        return max_err_xz # optimize on xz error
    return f_map

def calc_offset_map(name):
    data = load_data()

    func = get_f_map(name, data)

    initial = [0, 0]
    res = fmin(func, np.array(initial), ftol=1)

    print('\nOffset =', res)

def calc_all(name):
    def f(arr):
        """"
        This function will calculate all offsets for all maps and sm_a, sm_b.
        Format: [sm_a, sm_b, <x, z>...] x, z per map
        """
        datac = load_data('caucasus.txt')
        datapg = load_data('pg.txt')

        max_err_caucasus_xz, max_err_caucasus_laton = get_error_on_map('Caucasus', datac, [arr[0], arr[1], arr[2], arr[3]])
        max_err_pg_xz, max_err_pg_lat_lon = get_error_on_map('PersianGulf', datapg, [arr[0], arr[1], arr[4], arr[5]])
        # Add new maps here

        max_err_xz = max(max_err_caucasus_xz ,max_err_pg_xz)
        max_err_lat_lon = max(max_err_caucasus_laton, max_err_pg_lat_lon)
        print('step', max_err_xz, max_err_lat_lon, arr)
        return max_err_xz # optimize on xz error

    initial = [_CoordInterpolator.sm_a_default, _CoordInterpolator.sm_b_default,
               _terrain_data['Caucasus']['x'], _terrain_data['Caucasus']['z'],
               _terrain_data['PersianGulf']['x'], _terrain_data['PersianGulf']['z']]
    res = fmin(f, np.array(initial), ftol=1)

    print('\nResult =', res)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print('Usage: calcualte_offset.py <map_name>')
        exit(1)

    map_name = sys.argv[1]
    calc_offset_map(map_name)