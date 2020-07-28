import React, { useEffect } from 'react';

import './App.css';

import { CampaignMap } from './';
import { MenuBar } from './';
import { AppStateContainer } from '../models';

export function App() {
  const appState = AppStateContainer.useContainer();

  useEffect(() => {
    appState.initialize();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="App">
      <MenuBar/>
      <CampaignMap
        lat={43}
        lng={41}
        zoom={9}
        tileLayerUrl="https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}@2x.png?access_token=pk.eyJ1IjoiYm9ibW9yZXR0aSIsImEiOiJjazI4amV6eWswaWF2M2JtYjh3dmowdnQ1In0.XutSpPpaRm9LZudTNgVZwQ"
        units={appState.units}
      />
    </div>
  );
}
