import React, { useMemo } from 'react';
import ms from 'milsymbol';
import { Icon, Marker as CoreMarker, LeafletEvent, LatLng } from 'leaflet';
import { Marker, Popup, MarkerProps, MarkerEvents } from 'react-leaflet';

import { omit } from 'lodash';
import { AppStateContainer } from '../../../../models/appState';

export type SidcMarkerProps = MarkerProps &
  MarkerEvents & {
    sidc: string;
    label?: string;
  };

export function SidcMarkerNonMemo(props: SidcMarkerProps) {
  const { sidc, label } = props;

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
      {label && <Popup minWidth={100}>{label}</Popup>}
    </Marker>
  );
}

export function SidcMarker(props: SidcMarkerProps) {
  const { sidc, label, position } = props;
  const positionLatLng = position as LatLng;

  const { commanderMode } = AppStateContainer.useContainer();

  const memorizedItem = useMemo(() => <SidcMarkerNonMemo {...props} />, [// eslint-disable-line react-hooks/exhaustive-deps    
    sidc,
    label,
    positionLatLng.lat,
    positionLatLng.lng,
    commanderMode
  ]);

  return memorizedItem;
}
