import './index.css';

import 'bluebird-global';

import 'leaflet';

import React from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './components';
import {
  AppStateContainer,
  MapStateContainer,
  MissionStateContainer,
  SelectionStateContainer,
  SessionStateContainer,
  DcsStaticDataStateContainer
} from './models';
import * as serviceWorker from './serviceWorker';

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <AppStateContainer.Provider>
    <MapStateContainer.Provider>
      <MissionStateContainer.Provider>
        <SelectionStateContainer.Provider>
          <SessionStateContainer.Provider>
            <DcsStaticDataStateContainer.Provider>
              <App />
            </DcsStaticDataStateContainer.Provider>
          </SessionStateContainer.Provider>
        </SelectionStateContainer.Provider>
      </MissionStateContainer.Provider>
    </MapStateContainer.Provider>
  </AppStateContainer.Provider>,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
