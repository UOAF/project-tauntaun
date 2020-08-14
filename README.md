# Project Tauntaun

Project Tauntaun is browser based collaborative mission planning tool.

## Discord
https://discord.gg/ZkXCK3y

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
pip install -r requirements.txt
```
**Generate dcs_static.json**
```
cd data
python gen_dcs_static.py
copy dcs_static.json to client/src/data/dcs_static.json
```
**Run server**
```bash
py camp.py
```
**Open client**  
In a new terminal go to the client dir, read README for initial setup.
```bash
cd client
yarn start
```
**When done leave virtual env**
```bash
deactivate
```
