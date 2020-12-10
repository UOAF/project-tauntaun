#!/bin/bash

if [ ! -d "./tauntaun_live_editor" ]
then
  echo "Must be run from project root directory!"
  exit
fi

scripts/setup_env.sh

rm -rf frontend/node_modules

source env/bin/activate
pushd frontend && yarn && yarn build && popd

cp -r frontend/build tauntaun_live_editor/data/client

