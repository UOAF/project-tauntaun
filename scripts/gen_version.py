import os
import subprocess
import json

def main():
    TAUNTAUN_VERSION = os.getenv('TAUNTAUN_VERSION')

    if TAUNTAUN_VERSION is None:
        TAUNTAUN_VERSION = subprocess.check_output(['git', 'rev-parse', 'HEAD']).decode('utf-8')[0:8]

    version_dict = {
        'version': TAUNTAUN_VERSION
    }

    with open('version.json', 'w') as f:
        json.dump(version_dict, f)

if __name__ == "__main__":
    main()