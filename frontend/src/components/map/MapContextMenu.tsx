import { convertLeafletMapToKml, getGoogleEarthUrl, openInNewTab, saveKmlFile } from '../../models/util';
import React from 'react';
import { AppStateContainer } from '../../models';
import { ClickPosition, ContextMenu, ContextMenuOption } from '../contextmenu';
import { useMap } from 'react-leaflet';

export interface MapContextMenuProps {
  position: ClickPosition;
}

export function MapContextMenu(props: MapContextMenuProps) {
  const { commanderMode, setShowAddFlightForm, setLocation } = AppStateContainer.useContainer();
  const map = useMap();

  const contextMenuOptionsAdmin: Array<ContextMenuOption> = [{ label: 'Add Flight', value: 'add_flight' }];
  const contextMenuOptionsNormal: Array<ContextMenuOption> = [{ label: 'Recon', value: 'recon' }];
  const contextMenuOptionsNormal: Array<ContextMenuOption> = [{ label: 'Add JTAC', value: 'addJTAC' }];
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
      setShowAddFlightForm(true);
      setLocation(position.latlon);
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
    }
  };

  return <ContextMenu {...props} options={contextMenuOptions} onOptionSelected={handleOptionSelected} />;
}
