-- https://wiki.hoggitworld.com/view/DCS_Export_Script

-- **** Installation
-- * This script should be copied next to Export.lua, output Logs\gen_grid.txt
-- * Add these lines into Export.lua
-- Note: The script will run before every mission so remove Export.lua part after it is not needed
-- function LuaExportStart()
--   local dcsSr=require('lfs')
--   dofile(dcsSr.writedir()..[[Scripts\gen_grid.lua]])
-- end

local map_name = 'Syria'
local use_offset = false
local resolution = 100

-- Bounds are from pydcs
local top = 0
local left = 0
local bottom = 0
local right = 0

if map_name == 'Caucasus' then
  top = 380*1000
  left = -560*1000
  bottom = -600*1000
  right = 1130*1000
elseif map_name == 'PersianGulf' then
  top = -218768.750000
  left = -392081.937500
  bottom = 197357.906250
  right = 333129.125000
elseif map_name == 'Syria' then
  top = -320000
  left = -579986
  bottom = 300000
  right = 579998
elseif map_name == 'Nevada' then
  top = -166934.953125
  left =  -329334.875000
  bottom = -497177.656250
  right = 209836.890625
elseif map_name == 'Normandy' then
  top = 74967
  left = -114995
  bottom = -129982
  right = 129991
elseif map_name == 'TheChannel' then
  top = 74967
  left = -114995
  bottom = -129982
  right = 129991
end

local x_step = (bottom - top) / resolution
local z_step = (right - left) / resolution

local offset_x = 0
local offset_z = 0

if use_offset then
  offset_x = x_step / 2.0
  offset_z = z_step / 2.0
  resolution = resolution - 1
end

local dcsSr=require('lfs')
local file = io.open(dcsSr.writedir()..[[Logs\gen_grid.txt]], "w")

for i=0,resolution - 1 do
    for j=0,resolution - 1 do
        x = top + x_step * i + offset_x
        z = left + z_step * j + offset_z
        result = LoLoCoordinatesToGeoCoordinates(x, z)
        file:write(x, ' ', z, ' ', result.latitude, ' ', result.longitude, '\n')
    end
end

file:close()