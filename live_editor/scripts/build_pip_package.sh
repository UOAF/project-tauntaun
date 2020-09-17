#!/bin/bash

if [ $(basename "$PWD") != "project-tauntaun" ]
then
  echo "Must be run from project_tauntaun directory!"
  exit
fi

cd live_editor/backend

rm -rf dist
rm -rf tauntaun_live_editor.egg-info

python3 setup.py sdist --formats=gztar,zip



