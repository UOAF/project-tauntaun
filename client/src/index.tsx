import 'bluebird-global';

import 'leaflet';

import 'leaflet.pm';
import 'leaflet.pm/dist/leaflet.pm.css';

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import App from './components/App';
import { AppStateContainer } from './models/appState';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <AppStateContainer.Provider>
      <App />
    </AppStateContainer.Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
