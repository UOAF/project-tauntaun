import { convertLeafletMapToKml, getGoogleEarthUrl, openInNewTab, saveKmlFile } from '../../models/util';
import React, { useState } from 'react';
import { AppStateContainer, MissionStateContainer, SessionStateContainer } from '../../models';
import { ClickPosition, ContextMenu, ContextMenuOption } from '../contextmenu';
import { useMap } from 'react-leaflet';
import { gameService } from '../../services';

export interface MapContextMenuProps {
  position: ClickPosition;
}

export function MapContextMenu(props: MapContextMenuProps) {
  const { commanderMode, setShowAddFlightForm, setLocation, location } = AppStateContainer.useContainer();
  const map = useMap();

  const contextMenuOptionsAdmin: Array<ContextMenuOption> = [
    { label: 'Add Flight', value: 'add_flight' },
    { label: 'Add JTAC', value: 'addJTAC' }
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
      setLocation(position.latlon);

      gameService.sendAddJTAC('blue', 'USA', position.latlon);
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
