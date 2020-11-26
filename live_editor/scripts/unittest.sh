#!/bin/bash

if [ ! -d "./live_editor" ]
then
  echo "Must be run from project root directory!"
  exit
fi

source env/bin/activate

pushd live_editor/backend && python3 -m unittest discover test -p '*_test.py' && popd
