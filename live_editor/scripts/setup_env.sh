#!/bin/bash

if [ $(basename "$PWD") != "project-tauntaun" ]
then
  echo "Must be run from project_tauntaun directory!"
  exit
fi

# Dependencies: python3: virtualenv, npm: yarn
# pip install virtualenv
# npm install -g yarn

python3 -m venv env

source env/bin/activate
pip install -r requirements.txt

pushd live_editor/frontend && yarn install && popd

mkdir live_editor/frontend/src/data/

