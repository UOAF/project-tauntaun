import { convertLeafletMapToKml, getGoogleEarthUrl, openInNewTab, saveKmlFile } from '../../models/util';
import React from 'react';
import { AppStateContainer } from '../../models';
import { ClickPosition, ContextMenu, ContextMenuOption } from '../contextmenu';
import { useMap } from 'react-leaflet';
import { gameService } from '../../services';
import { SessionStateContainer } from '../../models/sessionState';
import { MissionStateContainer } from '../../models/missionState';

export interface MapContextMenuProps {
  position: ClickPosition;
}

export function MapContextMenu(props: MapContextMenuProps) {
  const { commanderMode, setShowAddFlightForm, setLocation } = AppStateContainer.useContainer();

  const { sessions, sessionId } = SessionStateContainer.useContainer();
  const sessionData = sessions[sessionId];
  const sessionCoalition = sessionData ? sessionData.coalition : '';

  const { mission } = MissionStateContainer.useContainer();

  const map = useMap();

  const contextMenuOptionsAdmin: Array<ContextMenuOption> = [
    { label: 'Add Flight', value: 'add_flight' },
    { label: 'Add JTAC (Experimental)', value: 'addJTAC' }
  ];
  const contextMenuOptionsNormal: Array<ContextMenuOption> = [{ label: 'Recon', value: 'recon' }];
  const contextMenuOptions: Array<ContextMenuOption> = commanderMode
    ? [...contextMenuOptionsAdmin, ...contextMenuOptionsNormal]
    : contextMenuOptionsNormal;

  const addFlightOnClick = (position: ClickPosition) => {
    if (position.latlon) {
      setShowAddFlightForm(true);
      setLocation(position.latlon);
    }
  };

  const addJTACOnClick = (position: ClickPosition) => {
    if (position.latlon) {
      const country = Object.keys(mission.coalition[sessionCoalition].countries)[0];

      gameService.sendAddJTAC(sessionCoalition, country, position.latlon);
    }
  };

  const reconOnClick = (position: ClickPosition) => {
    if (position.latlon) {
      const kml = convertLeafletMapToKml(map);
      saveKmlFile('markers.kml', kml);
      openInNewTab(getGoogleEarthUrl(position.latlon));
    }
  };

  const handleOptionSelected = (value: string, position: ClickPosition) => {
    switch (value) {
      case 'add_flight':
        addFlightOnClick(position);
        break;
      case 'recon':
        reconOnClick(position);
        break;
      case 'addJTAC':
        addJTACOnClick(position);
        break;
    }
  };

  return <ContextMenu {...props} options={contextMenuOptions} onOptionSelected={handleOptionSelected} />;
}
