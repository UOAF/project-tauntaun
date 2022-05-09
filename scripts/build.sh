#!/bin/bash

if [ ! -d "./tauntaun_live_editor" ]
then
  echo "Must be run from project root directory!"
  exit
fi

scripts/setup_env.sh

rm -rf frontend/node_modules

source env/bin/activate
export CI=false
pushd frontend && yarn && yarn build && popd

mkdir tauntaun_live_editor/data/client/
cp -r frontend/build/* tauntaun_live_editor/data/client/

