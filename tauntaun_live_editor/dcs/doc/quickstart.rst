Quickstart
==========

Creating a mission is fairly simple, the most important class in this respect is
:py:class:`dcs.mission.Mission`. This class contains all information for running a dcs mission.
It is a .zip file that contains several lua data structures and other resources like
briefing images, voice overs and other lua scripts.

::

 m = dcs.Mission()
 m.save('mission.miz')

This code is enough to create a mission file without any unit groups in the Caucasus(default)
terrain.

To add a A-10C flight group starting from Batumi airport use the following snippet::

 fg = m.flight_group_from_airport(m.country("USA"), "A-10C Flight Group",
                                  dcs.planes.A-10C, m.terrain.batumi(), group_size=2)
 fg.units[0].set_player()

This adds a A-10C flight with 2 planes starting cold from a free parking slot.
In the next line it also sets the first unit of the flight as player.
For more options when adding a flight see :py:meth:`dcs.mission.Mission.flight_group_from_airport`.
