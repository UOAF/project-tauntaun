# Development instructions

## Introduction

Tauntaun consists of two main parts: a backend implemented in Python and a frontend implemented in React/TypeScript. The backend uses the Quart server framework for network I/O. It uses PyDCS to load/save DCS .miz files as well as to provide abstractions for DCS mission file state. The frontend is implemented in React and uses (react-)esri-leaflet to provide mapping services.

## TL;DR

To get up and running, you need to install [Poetry](https://python-poetry.org/) and node/yarn. Then run the following commands

```
poetry install
poetry run python -m tauntaun_live_editor
```

For the frontend, run the following in another shell:
```
cd frontend
yarn install
yarn start
```

This should open Tauntaun in your OS default brower.

## Backend

First update PyDCS, which is included with Tauntaun as a git submodule:

```
git submodule update --init --recursive
```

The backend makes use of [Poetry](https://python-poetry.org/) to manage Python dependencies. You can install Poetry for your OS by following these [instructions](https://python-poetry.org/docs/#installation). For Windows, in PowerShell, you can run 
```PowerShell
(Invoke-WebRequest -Uri https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py -UseBasicParsing).Content | python -
```
to install Poetry.

Once Poetry is installed, from the repository root, run:

```
poetry install
```

which will install the required Python packages (locally to this clone of the repository).

Once this is done, you can run the dev server with

```
poetry run python -m tauntaun_live_editor
```

## Frontend

If you followed the steps in the previous section, you have the dev backend server running, but you haven't set up the frontend, so there is no way to interact with it. In a production environment, the frontend can be served by the backend, but it must be built and copied into the frontend's static directory (See the [production build section](#Production-build)). For development, this is inconvenient, as a time-consuming build will lengthen your iteration cycle.

Instead, you can start a development server which will automatically open your browser to the frontend and will reload whenever you make a change to the frontend. This is great for frontend development. (Note however, that if you do make a change to the backend, you will have to manually restart it).

First, however, you need to install the [latest version of Node.js](https://nodejs.org/en/) (install the LTS option). Then install yarn:

```
npm install -g yarn
```
You only need to install yarn once. Then, you can run the frontend development server:

```
yarn install
yarn start
```

## Production build

To make a full production build, you can run

```
poetry run python scripts/build.py
```
which will update PyDCS, install/update Python dependencies, make an optimized build of the frontend, and copy that into the backend's static directory.

_There is no need to do this on your machine for a release, since there is a github action that does the same._
