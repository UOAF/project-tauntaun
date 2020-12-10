import sys
import os
import pathlib
from dataclasses import dataclass
from dataclasses_json import dataclass_json

@dataclass_json
@dataclass
class Config:
    map_token: str = ""
    admin_password: str = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4" # SHA256, 1234
    autosave: bool = True
    default_coalition: str = ""
    default_mission: str = ""

def _get_datadir() -> pathlib.Path:

    """
    Returns a parent directory path
    where persistent application data can be stored.

    # linux: ~/.local/share
    # macOS: ~/Library/Application Support
    # windows: C:/Users/<USER>/AppData/Roaming
    """

    home = pathlib.Path.home()

    if sys.platform == "win32":
        return home / "AppData/Roaming"
    elif sys.platform == "linux":
        return home / ".local/share"
    elif sys.platform == "darwin":
        return home / "Library/Application Support"
    else:
        raise('Unsupported OS {}'.format(sys.platform))

class _ConfigFileManager:
    datadir = _get_datadir() / "tauntaun-live-editor"
    config_path = datadir / "config.json"

    @staticmethod
    def load(p_config_path = None):
        config_path = p_config_path if p_config_path is not None else _ConfigFileManager.config_path

        if p_config_path:
            if not os.path.isfile(config_path):
                return None
        else:
            if not _ConfigFileManager.datadir.exists():
                return None

        if config_path.exists():
            with open(config_path, 'r') as fp:
                config_json = fp.read()
                return Config.from_json(config_json)
        else:
            return None

    @staticmethod
    def save(config: Config, p_config_path = None):
        config_path = p_config_path if p_config_path is not None else _ConfigFileManager.config_path

        if not p_config_path:
            try:
                _ConfigFileManager.datadir.mkdir(parents=True)
            except FileExistsError:
                pass

        with open(config_path, 'w') as fp:
            config_json = config.to_json()
            fp.write(config_json)

config = None

def load_config(config_path_str = None):
    global config
    config_path =  pathlib.Path(config_path_str) if config_path_str else None
    loaded_config = _ConfigFileManager.load(config_path)
    if (loaded_config is None):
        loaded_config = Config()

    # Create new config file if not yet created and "auto deserialization version handling":
    # re-save so new fields are added with their default values
    _ConfigFileManager.save(loaded_config, config_path)

    config = loaded_config

