## Tauntaun Live Editor

![Screenshot](https://github.com/UOAF/project-tauntaun/raw/v0.1.0/images/screenshot.png)

![Unittests](https://github.com/UOAF/project-tauntaun/workflows/Unittests/badge.svg)

[![Download](https://img.shields.io/github/downloads/UOAF/project-tauntaun/total?label=Download)](https://github.com/UOAF/project-tauntaun/releases)

#### Description
Tauntaun Live Editor is browser based collaborative mission planning tool for DCS events.

#### Installation
#### Windows release
**Use develompent builds** ~~Executable is available under [releases](https://github.com/UOAF/project-tauntaun/releases).~~
    
Develompent builds are available under [actions](https://github.com/UOAF/project-tauntaun/actions/workflows/exe.yml)   
Click the top "Build exe" action and on the bottom of the page there should be a link to the dev build "tauntaun_live_editor_\<long number\>".    
_You need to be logged in to be able to see the download links._    
I recommend checking dev builds if something is missing(e.g. new weapon) or broken after a DCS patch.

#### Configuration
Configuration can be found at
```
Windows: C:/<User>/AppData/Roaming/tauntaun_live_editor/config.json
```
admin_password: password in SHA256 format, default is 1234
#### Run server
```
tauntaun_live_editor.exe
```

#### Join to server
Open https://localhost:8080  
Enter admin mode with right clicking the arrow in the top left corner and enter the admin password. 

#### Wiki / How to use Tauntaun
https://github.com/UOAF/project-tauntaun/wiki

#### Bug reporting and feature requests
Use github issues:
https://github.com/UOAF/project-tauntaun/issues

#### Development
See [Development](doc/Development.md) in the doc directory.

#### License 
GNU Lesser General Public License v3.0

#### Contact
https://github.com/UOAF/project-tauntaun  
https://discord.gg/ZkXCK3y

