#!/usr/bin/python3

from datadiff import diff
import argparse
import zipfile
import dcs


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("fileA")
    parser.add_argument("fileB")

    args = parser.parse_args()

    def loaddict(fname, miz):
        with miz.open(fname) as mfile:
            data = mfile.read()
            data = data.decode()
            return dcs.lua.loads(data)

    with zipfile.ZipFile(args.fileA, 'r') as mizA:
        missionA = loaddict('mission', mizA)

    with zipfile.ZipFile(args.fileB, 'r') as mizA:
        missionB = loaddict('mission', mizA)

    print(diff(missionA, missionB))

if __name__ == "__main__":
    main()
