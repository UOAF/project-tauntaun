import React from 'react';

import { Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import { LatLng } from 'leaflet';

export type PointXY = {
  x: number;
  y: number;
};

export type ClickPosition = {
  xy: PointXY;
  latlon?: LatLng;
};

const defaultClickPositionValue: ClickPosition = {
  xy: { x: 0, y: 0 } as PointXY
};

export type ContextMenuOption = {
  label: string;
  value: string;
};

export interface ContextMenuProps {
  options: Array<ContextMenuOption>;
  position: ClickPosition;
  onOptionSelected?: (value: string, position: ClickPosition) => void;
}

export const ContextMenu = (props: ContextMenuProps): JSX.Element => {
  const { options, position, onOptionSelected } = props;

  const [visible, setVisible] = useState(true);
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

  const handleClick = (value: string) => {
    onOptionSelected?.(value, position ? position : defaultClickPositionValue);
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
      {options.map((option, index) => (
        <MenuItem key={`ContextMenuItem ${index}`} onClick={() => handleClick(option.value)}>
          {option.label}
        </MenuItem>
      ))}
      <MenuItem onClick={handleClose}>Close</MenuItem>
    </Menu>
  );
};
