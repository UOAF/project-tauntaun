#!/bin/bash

if [ ! -d "./live_editor" ]
then
  echo "Must be run from project root directory!"
  exit
fi

source env/bin/activate

pushd live_editor/backend/ && (python -m tauntaun_live_editor &) && popd
pushd live_editor/frontend && yarn start && popd
