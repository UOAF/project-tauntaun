import React from 'react';

import { Menu } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem/MenuItem';
import { useState } from 'react';
import { LatLng } from 'leaflet';
import { AppStateContainer } from '../models/appState';

export type PointXY = {
  x: number;
  y: number;
};

export type ClickPosition = {
  xy: PointXY;
  latlon?: LatLng;
};

export interface ContextMenuProps {
  position: ClickPosition | null;
}

export function ContextMenu(props: ContextMenuProps) {
  const appState = AppStateContainer.useContainer();

  const { position } = props;

  const [visible, setVisible] = useState(position !== null);
  const [savedPosition, setSavedPosition] = useState(position);

  if (position !== savedPosition) {
    setSavedPosition(position);
    if (!visible) {
      setVisible(true);
    }
  }

  const left = position ? position.xy.x : 0;
  const top = position ? position.xy.y : 0;

  const handleClose = () => {
    setVisible(false);
  };

  const addFlightOnClick = () => {
    appState.setLocation(position?.latlon);
    setVisible(false);
  };

  return (
    <Menu
      id="simple-menu"
      anchorPosition={{ left: left, top: top }}
      anchorReference="anchorPosition"
      open={visible}
      onClose={handleClose}
      onContextMenu={handleClose}
    >
      {appState.adminMode && <MenuItem onClick={addFlightOnClick}>Add flight</MenuItem>}
      <MenuItem onClick={handleClose}>Recon</MenuItem>
      <MenuItem onClick={handleClose}>Close</MenuItem>
    </Menu>
  );
}
