#!/bin/bash

if [ ! -d "./live_editor" ]
then
  echo "Must be run from project root directory!"
  exit
fi

cd live_editor/backend

rm -rf dist
rm -rf tauntaun_live_editor.egg-info
rm -rf README.md

cp ../../README.md . 

python3 setup.py bdist_wheel sdist --formats=gztar,zip

