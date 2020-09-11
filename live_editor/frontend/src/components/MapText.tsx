import React from 'react';

import { Marker, Tooltip } from 'react-leaflet';
import { LatLng } from 'leaflet';

export type MapTextProps = {
  text: string;
  position: LatLng;
};

export function MapText(props: MapTextProps) {
  const { text, position } = props;

  return (
    <Marker position={position} opacity={0}>
      <Tooltip className="MapText colorRed" direction="right" offset={[-20, 27]} permanent={true} >
        {text}
      </Tooltip>
    </Marker>
  );
}
