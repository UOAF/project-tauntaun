from glob import glob
import setuptools

with open("README.md", "r") as fh:
    long_description = fh.read()


setuptools.setup(
    name="tauntaun-live-editor",
    version="0.0.1",
    author="UOAF",
    author_email="uoaf@example.com",
    description="Project Tauntaun Live Editor",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/UOAF/project-tauntaun",
    packages=setuptools.find_packages(exclude=["test", "data"]),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    include_package_data=True,
    package_data={
        "": ["data/Missions/default.miz"] +
            glob("data/client/*.*") +
            glob("data/client/statis/css/*.*") +
            glob("data/client/statis/js/*.*"),
    },
    install_requires=[
      'wheel>=0.35.1',
      'pydcs@git+https://github.com/pydcs/dcs.git@c203e5a1b8d5eb42d559dab074e668bf37fa5158',
      'Quart>=0.12.0'
    ],
    entry_points={
        "console_scripts": [
            "tauntaun = tauntaun_live_editor.camp:main"
        ]
    },
    python_requires='>=3.6',
)
