#!/bin/bash

if [ ! -d "./live_editor" ]
then
  echo "Must be run from project root directory!"
  exit
fi

source env/bin/activate
python live_editor/backend/tools/gen_client_data.py
cp dcs_static.json live_editor/frontend/src/data/
rm dcs_static.json
