Random mission script
=====================

pydcs delivers a small random mission creator script.
This script was indented to show features of the framework and is also a little testbed.

It is invoked by the commandline with the following arguments::

 usage: caucasus_random_mission.py [-h] [-a {A-10C,Su-25T,M-2000C,Ka-50,MiG-21Bis}]
                         [-p PLAYERCOUNT] [-s {inflight,runway,warm,cold}]
                         [-t {main,CAS,CAP,refuel}]
                         [-d {random,day,night,dusk,dawn,noon}]
                         [-w {dynamic,dyncyclone,dynanti,dynone,clear}] [-u]
                         [--show-stats] [-o OUTPUT]

 Random DCS mission generator

 optional arguments:
   -h, --help            show this help message and exit
   -a {A-10C,Su-25T,M-2000C,Ka-50,MiG-21Bis}, --aircrafttype {A-10C,Su-25T,M-2000C,Ka-50,MiG-21Bis}
                         Player aircraft type
   -p PLAYERCOUNT, --playercount PLAYERCOUNT
   -s {inflight,runway,warm,cold}, --start {inflight,runway,warm,cold}
   -t {main,CAS,CAP,refuel}, --missiontype {main,CAS,CAP,refuel}
   -d {random,day,night,dusk,dawn,noon}, --daytime {random,day,night,dusk,dawn,noon}
   -w {dynamic,dyncyclone,dynanti,dynone,clear}, --weather {dynamic,dyncyclone,dynanti,dynone,clear}
   -u, --unhide          Show enemy pre mission
   --show-stats          Show generated missions stats
   -o OUTPUT, --output OUTPUT
                         Name and path of the generated mission
