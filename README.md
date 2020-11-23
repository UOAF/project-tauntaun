## Tauntaun Live Editor

![Screenshot](https://github.com/UOAF/project-tauntaun/raw/v0.1.0/images/screenshot.png)

#### Description
Tauntaun Live Editor is browser based collaborative mission planning tool for DCS events.

#### Requirements
Python 3.8  
A MapBox access token (free tier is available)
#### Installation
##### pip
```bash
pip install wheel
pip install tauntaun_live_editor
```
##### archive
```bash
pip install wheel

extract archive
cd extracted archive
pip install .
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
tauntaun_live_editor
```

#### Join to server
Open https://localhost:8080  
Enter admin mode with right clicking the arrow in the top left corner and enter the admin password. 

#### Wiki / How to use Tauntaun
https://github.com/UOAF/project-tauntaun/wiki

#### Update pydcs after new DCS patch
Pydcs can be updated independently. First check if there was a "data-export" since the new patch released at: https://github.com/pydcs/dcs/commits/master, if yes upgrade to the latest github commit:

```
pip uninstall pydcs
pip install git+https://github.com/pydcs/dcs.git
```
Note: If you install Tauntaun from pip you most likely want to do this step right after installation.

#### Bug reporting and feature requests
Use github issues:
https://github.com/UOAF/project-tauntaun/issues

#### License 
GNU General Public License v3 (GPLv3) (GPL)

#### Contact
https://github.com/UOAF/project-tauntaun  
https://discord.gg/ZkXCK3y

