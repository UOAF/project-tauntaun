### How to get offset for a new map

##### Generate a coordinate dataset
* Find the bounds in pydcs, should be in the class `<mapname>` e.g. `caucasus.py/Caucasus`.
* Add it to `gen_grid.lua` and set map name to the new map.
* Copy `gen_grid.lua` to `Save Games/DCS<.openbeta>/Scripts/` - this is where the `Export.lua` file should be.
* Add gen_grid call to `Export.lua`, see `gen_grid.lua`.
* Open mission editor in DCS with a new map, enter the mission, exit DCS.
* Output should be under under `Save Games/DCS<.openbeta>/Logs` named `gen_grid.txt`.

##### Calculate offset
* Create new entry in `coord.py/_terrain_map` for the new map.   
* Set `southhemi, zone`: zone should be set to the UTM zone but we don't know what what DCS is using as a base.
  *Note: Zone can be added as an optimization parameter then it not have to be set manually (not implemented).*
* Copy `grid_gen.txt` next to `calculate_offset.py` and run it with one parameter: the name of the map.
* If it manages to find a soulution use the offset and update `coord.py/_terrain_map`.

##### Testing
* Add new test to `coord_test.py`.\
*Just pick some random values from the dataset.*

##### Troubleshooting 
* `calculate_offset.py` is not converging\
In this case probably the UTM zone is incorrect or semi major axis refinement is needed, for the latter see `calculate_offset.py`. 
 
*Note: Actually the semi major axes should be pretty close what DCS is using so there should not be any distortion which means the offset can be calculated just by sampling one coordinate, even manually.* 
