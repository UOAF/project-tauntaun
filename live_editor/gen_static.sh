#!/bin/bash
# Should be run under project root: project_tauntaun/
source env/bin/activate
python live_editor/backend/data/gen_client_data.py
cp live_editor/backend/data/dcs_static.json live_editor/frontend/src/data/

