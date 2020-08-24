#!/bin/bash

if [ $(basename "$PWD") != "project-tauntaun" ]
then
  echo "Must be run from project_tauntaun directory!"
  exit
fi

source env/bin/activate
python live_editor/backend/data/gen_client_data.py
cp live_editor/backend/data/dcs_static.json live_editor/frontend/src/data/
