import './index.css';

import 'bluebird-global';

import 'leaflet';

import React from 'react';
import ReactDOM from 'react-dom';

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

ReactDOM.render(
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
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
