# Project tauntaun - Live editor

Live editor is browser based collaborative mission planning tool for DCS. Having python, node.js, and yarn installed is required in order to run this project locally.

## Usage

```bash
cd ..\project_tauntaun
```
**Create python virtual environment (one time)**
```bash
py -m venv env
```
**Activate virtual env**
```bash
env\Scripts\activate
```
**Install/update requirements**  
```bash
pip install wheel
pip install -r requirements.txt
```
**Generate dcs_static.json**
```
cd live_editor/backend/tauntaun_live_editor/tools
python gen_client_data.py
copy dcs_static.json to live_editor/frontend/src/data/dcs_static.json
```
**Run server**
```bash
cd project_tauntaun/backend
py -m tauntaun_live_editor
```
**Install yarn (one time)**  
```bash
npm install -g yarn
```

**Install web client dependencies (after updates to the frontend)**  
In a new terminal go to the frontend dir.
```bash
cd live_editor/frontend
yarn install
```

**Open web client**  
In a new terminal go to the frontend dir.
```bash
cd live_editor/frontend
yarn start
```

**Run tests**
```bash
cd live_editor/backend
python3 -m unittest discover test -p '*_test.py'
```

**Build pip package - linux**
Works in clean repo.
```bash
cd project_tauntaun
live_editor/scripts/build.sh
live_editor/scripts/build_pip_package.sh
```

**Notes**

**How to pull package from github with pip**  
requirements.txt
```
git+https://github.com/pydcs/dcs.git@5c02bf8ea5e3ec5afccc0135e31a3dd15e21342b # pydcs
```
setup.py
```
pydcs@git+https://github.com/pydcs/dcs.git@5c02bf8ea5e3ec5afccc0135e31a3dd15e21342b
```
