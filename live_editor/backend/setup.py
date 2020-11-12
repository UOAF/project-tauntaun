from glob import glob
import setuptools

with open("../../README.md", "r") as fh:
    long_description = fh.read()


setuptools.setup(
    name="tauntaun-live-editor",
    version="0.1.1",
    author="UOAF",
    author_email="uoaf@fakemail.invalid",
    description="Project Tauntaun Live Editor",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/UOAF/project-tauntaun",
    packages=setuptools.find_packages(exclude=["test", "data"]),
    classifiers=[
        "Programming Language :: Python :: 3.8",
        "License :: OSI Approved :: GNU General Public License v3 (GPLv3)",
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
      'pydcs>=0.12.0',
      'Quart>=0.12.0',
      'dataclasses-json>=0.5.2'
    ],
    entry_points={
        "console_scripts": [
            "tauntaun_live_editor = tauntaun_live_editor.camp:main"
        ]
    },
    python_requires='>=3.8',
)
