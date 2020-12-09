import os
import asyncio
import logging

class Timer:
    def __init__(self, timeout, callback, periodic = False):
        self._timeout = timeout
        self._callback = callback
        self._running = False
        self._periodic = periodic

    async def _job(self):
        await asyncio.sleep(self._timeout)
        await self._callback()
        if self._periodic:
            self._task = asyncio.ensure_future(self._job())

    def start(self):
        self._task = asyncio.ensure_future(self._job())
        self._running = True

    def cancel(self):
        self._task.cancel()
        self._running = False

    def is_running(self):
        return self._running

def get_saved_games_dir():
    saved_games = os.path.abspath(os.path.join(os.environ['USERPROFILE'],
                                               'Saved Games'))
    return saved_games

def get_dcs_dir():
    dcs_dir = os.path.join(get_saved_games_dir(), "DCS.openbeta")

    if not os.path.exists(dcs_dir):
        dcs_dir = os.path.join(get_saved_games_dir(), "DCS")

    if not os.path.exists(dcs_dir):
        dcs_dir = os.path.join(get_saved_games_dir(), "DCS.openbeta_server")

        if not os.path.exists(dcs_dir):
            return ""

    return dcs_dir


def knots_to_kph(knots):
    return knots * 1.8502

def feet_to_meters(feet):
    return feet * 0.3048

def point_along_route(p1, p2, distance):
    heading = p1.heading_between_point(p2)
    if distance < 0:
        distance = p1.distance_to_point(p2) - distance
    return p1.point_from_heading(heading, distance)

def is_instance_of_any(obj, types):
    return any(isinstance(obj, t) for t in types)

def fixup_jsonlike(x):
    def fixup_helper(x): 
        if isinstance(x, dict):
            for key in x:
                val = x[key]
                if is_instance_of_any(val, (dict, list)):
                    fixup_jsonlike(val)
                elif not is_instance_of_any(val, (int, float, str)):
                    x[key] = str(val)
        elif isinstance(x, list):
            for idx, val in enumerate(x):
                if is_instance_of_any(val, (dict, list)):
                    fixup_jsonlike(val)
                elif not is_instance_of_any(val, (int, float, str)):
                    x[idx] = str(val)

    fixup_helper(x)
    return x

_ROOT = os.path.abspath(os.path.dirname(__file__))
def get_data_path():
    return os.path.join(_ROOT, 'data')

def is_posix():
    return os.name == 'posix'

def get_miz_path():
    if is_posix():
        dcs_dir = get_data_path()
    else:
        dcs_dir = get_dcs_dir()
        if not dcs_dir:
            logging.info("No DCS dir found. Not saving")
            return

    return os.path.join(dcs_dir, "Missions")
