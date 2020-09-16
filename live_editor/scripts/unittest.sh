#!/bin/bash

if [ $(basename "$PWD") != "project-tauntaun" ]
then
  echo "Must be run from project_tauntaun directory!"
  exit
fi

source env/bin/activate

pushd live_editor/backend && python3 -m unittest discover test -p '*_test.py' && popd
