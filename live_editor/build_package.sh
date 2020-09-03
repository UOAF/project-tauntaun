#!/bin/bash

if [ $(basename "$PWD") != "project-tauntaun" ]
then
  echo "Must be run from project_tauntaun directory!"
  exit
fi

live_editor/setup_env.sh

live_editor/gen_static.sh

source env/bin/activate
pushd live_editor/frontend && yarn build && popd

cp -r live_editor/frontend/build live_editor/backend/server/client/

mkdir build
pyinstaller live_editor/live_editor.spec --onefile --workpath build/build --distpath build/dist

pushd build/dist/ && tar -czf ../live_editor.tar.gz live_editor && popd

# Cleanup
rm -rf build/build build/dist
rm -rf live_editor/backend/server/client

