import React from 'react';
import { Icon } from 'leaflet';
import { Marker, MarkerProps } from 'react-leaflet';

import { omit } from 'lodash';

export function BullseyeMarker(props: MarkerProps) {
  const icon = new Icon({
    iconUrl: 'bullseye.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

  return <Marker {...omit(props, 'onadd', 'icon')} icon={icon} />;
}
