import React from 'react';
import ms from 'milsymbol';
import { Icon, Marker as CoreMarker, LeafletEvent } from 'leaflet';
import { Marker, Popup, MarkerProps, MarkerEvents } from 'react-leaflet';

import { omit } from 'lodash';

export type SidcMarkerProps = MarkerProps &
  MarkerEvents & {
    sidc: string;
    name?: string;
  };

export function SidcMarker(props: SidcMarkerProps) {
  const { sidc, name } = props;

  const symbol = new ms.Symbol(sidc, { size: 20 });
  const anchor = symbol.getAnchor();
  const icon = new Icon({
    iconUrl: symbol.toDataURL(),
    iconAnchor: [anchor.x, anchor.y]
  });

  const onMarkerAdded = (event: LeafletEvent) => {
    const marker = event.target as CoreMarker;
    marker.pm.disable();
  };

  return (
    <Marker {...omit(props, 'onadd', 'icon')} onadd={onMarkerAdded} icon={icon}>
      {name && <Popup>{name}</Popup>}
    </Marker>
  );
}
