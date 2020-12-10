#!/bin/bash

if [ ! -d "./tauntaun_live_editor" ]
then
  echo "Must be run from project root directory!"
  exit
fi

source env/bin/activate

python3 -m unittest discover test -p '*_test.py'
