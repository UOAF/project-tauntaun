import React, { useEffect } from 'react';

import './App.css';

import { CampaignMap, EditWaypointForm } from './';
import { MenuBar } from './';
import { AppStateContainer, AddFlightMode, EditGroupMode, Group } from '../models';
import { AddFlightForm } from './AddFlightForm';
import { LeafletMouseEvent } from 'leaflet';
import { findGroupById } from '../models/dcs_util';

export function App() {
  const appState = AppStateContainer.useContainer();

  useEffect(() => {
    appState.initialize();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { masterMode } = appState;

  const masterModeName = masterMode?.name;
  const addFlightMode = masterMode as AddFlightMode;
  const editGroupMode = masterMode as EditGroupMode;
  const location = addFlightMode.location;
  const selectedWaypoint = editGroupMode.selectedWaypoint;
  const selectedGroupId = editGroupMode.selectedGroupId;

  const mapOnClick = (e: LeafletMouseEvent) => {
    if (masterModeName === 'AddFlightMode') {
      appState.setLocation(e.latlng);
    }
  };

  const groupMarkerOnClick = (group: Group): void => {
    if (masterModeName !== 'EditGroupMode') return;

    console.info(`selecting group`, group);

    if (selectedGroupId === undefined) {
      appState.selectGroup(group);
    }
    if (selectedGroupId === group.id) {
      appState.selectGroup(undefined);
    } else {
      appState.selectGroup(group);
    }
  };

  const renderEditWaypointForm = () => {
    if (masterModeName === 'EditGroupMode' && selectedGroupId && selectedWaypoint) {
      const group = findGroupById(appState.mission, selectedGroupId);
      if (group) {
        return <EditWaypointForm group={group} pointIndex={selectedWaypoint} />;
      }
    }

    return;
  };

  return (
    <div>
      <MenuBar />
      {masterModeName === 'AddFlightMode' && location && <AddFlightForm location={location} />}
      {renderEditWaypointForm()};
      <CampaignMap
        lat={43}
        lng={41}
        zoom={9}
        tileLayerUrl="https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}@2x.png?access_token=pk.eyJ1IjoiYm9ibW9yZXR0aSIsImEiOiJjazI4amV6eWswaWF2M2JtYjh3dmowdnQ1In0.XutSpPpaRm9LZudTNgVZwQ"
        mission={appState.mission}
        selectedGroupId={masterModeName === 'EditGroupMode' ? editGroupMode.selectedGroupId : undefined}
        onMapClick={mapOnClick}
        groupMarkerOnClick={groupMarkerOnClick}
      />
    </div>
  );
}
