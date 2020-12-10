#!/bin/bash

if [ ! -d "./tauntaun_live_editor" ]
then
  echo "Must be run from project root directory!"
  exit
fi

rm -rf dist
rm -rf tauntaun_live_editor.egg-info

python3 setup.py bdist_wheel sdist --formats=gztar,zip

