#!/bin/bash
# Should be run under project root: project_tauntaun/
source env/bin/activate
python live_editor/backend/camp.py &
cd live_editor/frontend
yarn start

