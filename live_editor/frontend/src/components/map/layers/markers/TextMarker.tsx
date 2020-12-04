import './TextMarker.css';

import React from 'react';

import { Marker, Tooltip } from 'react-leaflet';
import { LatLng } from 'leaflet';

export type TextMarkerProps = {
  text: string;
  position: LatLng;
  color?: string;
  backgroundColor?: string;
  size?: number;
};

export function TextMarker(props: TextMarkerProps) {
  const { text, position, color: colorProp, size: sizeProp, backgroundColor: backgroundColorProp } = props;
  const color = colorProp ? colorProp : 'black';
  const backgroundColor = backgroundColorProp ? backgroundColorProp : 'transparent';
  const size = sizeProp ? `${sizeProp}px` : '12px';

  return (
    <Marker position={position} opacity={0}>
      <Tooltip className="TextMarkerTooltip" direction="right" offset={[-20, 27]} permanent={true}>
        <span className="TextMarkerText" style={{ color: color, backgroundColor: backgroundColor, fontSize: size }}>
          {text}
        </span>
      </Tooltip>
    </Marker>
  );
}
