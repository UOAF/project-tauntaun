#!/bin/bash
source env/bin/activate
python camp.py &
cd client
yarn start

