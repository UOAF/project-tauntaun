## Tauntaun Live Editor

![Screenshot](https://github.com/UOAF/project-tauntaun/raw/v0.1.0/images/screenshot.png)

![Unittests](https://github.com/UOAF/project-tauntaun/workflows/Unittests/badge.svg)

[![Download](https://img.shields.io/github/downloads/UOAF/project-tauntaun/total?label=Download)](https://github.com/UOAF/project-tauntaun/releases)

#### Description
Tauntaun Live Editor is browser based collaborative mission planning tool for DCS events.

#### Requirements
A [mapbox](https://www.mapbox.com/) access token (free tier is available)
#### Installation
#### Windows release
Executable is available under [releases](https://github.com/UOAF/project-tauntaun/releases).

##### Python 3.8
##### pip
```bash
pip install wheel # Only on Linux
pip install tauntaun_live_editor
```
##### archive
```bash
pip install wheel # Only on Linux

extract archive
cd extracted archive
pip install .
```

#### Upgrade
```
pip install --upgrade tauntaun_live_editor
```

#### Configuration
Configuration can be found at
```
Windows: C:/<User>/AppData/Roaming/tauntaun_live_editor/config.json
Linux: ~/.local/share/tauntaun_live_editor/config.json
MacOs: ~/Library/Application Support/tauntaun_live_editor/config.json
```
map_token: MapBox access token  
admin_password: password in SHA256 format, default is 1234
#### Run server
```
# Windows release
tauntaun_live_editor.exe

# Python module
tauntaun_live_editor
# Or if that does not work for some reason
py -m tauntaun_live_editor # Windows
python3 -m tauntaun_live_editor # Linux
```

#### Join to server
Open https://localhost:8080  
Enter admin mode with right clicking the arrow in the top left corner and enter the admin password. 

#### Wiki / How to use Tauntaun
https://github.com/UOAF/project-tauntaun/wiki

#### Bug reporting and feature requests
Use github issues:
https://github.com/UOAF/project-tauntaun/issues

#### License 
GNU General Public License v3 (GPLv3) (GPL)

#### Contact
https://github.com/UOAF/project-tauntaun  
https://discord.gg/ZkXCK3y

