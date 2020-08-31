#!/bin/bash

if [ $(basename "$PWD") != "project-tauntaun" ]
then
  echo "Must be run from project_tauntaun directory!"
  exit
fi

source env/bin/activate
python live_editor/backend/camp.py &
pushd live_editor/frontend && yarn start && popd
