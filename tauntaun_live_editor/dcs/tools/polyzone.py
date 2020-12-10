import dcs
import argparse
import re
from itertools import groupby

import dcs.triggers


def dump_polyzones(mfile: str):

    m = dcs.mission.Mission()
    m.load_file(mfile)

    def sortkey(x: dcs.triggers.TriggerZone):
        g = re.match(r"([^0-9]*)([0-9]*)", x.name)
        if g:
            return g.group(1).strip()

    def num(x: dcs.triggers.TriggerZone):
        g = re.match(r"([^0-9]*)([0-9]*)", x.name)
        if g:
            return int(g.group(2) if g.group(2) else 0)
    zones = sorted(m.triggers.zones(), key=sortkey)
    zonedict = {}
    for k, g in groupby(zones, sortkey):
        sgroups = sorted(g, key=num)
        zonedict[k] = dcs.mapping.Polygon([t.position for t in sgroups])

    for z in zonedict:
        print(z, zonedict[z])
    return []


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("missionfiles", nargs="+")

    args = parser.parse_args()
    for file in args.missionfiles:
        print(file)
        dump_polyzones(file)
    return 0


if __name__ == "__main__":
    main()
