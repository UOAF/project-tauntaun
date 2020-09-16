#!/bin/bash

if [ $(basename "$PWD") != "project-tauntaun" ]
then
  echo "Must be run from project_tauntaun directory!"
  exit
fi

#live_editor/scripts/build.sh

source env/bin/activate

mkdir build
pyinstaller live_editor/backend/live_editor.spec --onefile --workpath build/build --distpath build/dist

pushd build/dist/ && tar -czf ../live_editor.tar.gz live_editor && popd

# Cleanup
rm -rf build/build build/dist
