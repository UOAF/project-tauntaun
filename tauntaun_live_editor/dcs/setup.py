from setuptools import setup
from codecs import open
from os import path

here = path.abspath(path.dirname(__file__))

long_description = ''
with open(path.join(here, 'README.md'), encoding='utf-8') as f:
    for line in f:
        if line.startswith('## Sample'):
            break
        long_description += line

setup(
    name="pydcs",
    version='0.12.0',
    description="A Digital Combat Simulator mission builder framework",
    long_description=long_description,
    url='https://github.com/pydcs/dcs',
    author="Peinthor Rene",
    author_email="peinthor@gmail.com",
    license="LGPLv3",
    classifiers=[
        'Development Status :: 4 - Beta',
        'Topic :: Games/Entertainment :: Simulation',
        'Intended Audience :: Developers',
        'Intended Audience :: End Users/Desktop',
        'License :: OSI Approved :: GNU Lesser General Public License v3 (LGPLv3)',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3 :: Only'
    ],
    keywords='dcs digital combat simulator eagle dynamics mission framework',
    packages=['dcs', 'dcs/terrain', 'dcs/lua', 'dcs/scripts'],
    package_data={
        'dcs/terrain': ['caucasus.p', 'nevada.p']
    },
    entry_points={
        'console_scripts': [
            'dcs_random=dcs.scripts.caucasus_random_mission:main',
            'dcs_dogfight_wwii=dcs.scripts.dogfight_wwii:main',
            'dcs_oil_convoy=dcs.scripts.destroy_oil_transport:main'
        ]
    },
    test_suite="tests"
)
