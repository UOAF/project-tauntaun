#!/bin/bash

if [ ! -d "./tauntaun_live_editor" ]
then
  echo "Must be run from project root directory!"
  exit
fi

# Dependencies: python3: virtualenv, npm: yarn
# pip install virtualenv
# npm install -g yarn

git submodule update --init --recursive

python3 -m venv env

source env/bin/activate
pip3 install wheel
pip install -r requirements.txt
pip install -r tauntaun_live_editor/dcs/requirements.txt

pushd frontend && yarn install && popd
