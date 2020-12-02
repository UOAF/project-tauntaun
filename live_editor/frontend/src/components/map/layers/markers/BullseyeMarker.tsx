import React, { useMemo } from 'react';
import { Icon, LatLng } from 'leaflet';
import { Marker, MarkerProps } from 'react-leaflet';

import { omit } from 'lodash';

export function BullseyeMarkerNonMemo(props: MarkerProps) {
  const icon = new Icon({
    iconUrl: 'bullseye.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

  return <Marker {...omit(props, 'onadd', 'icon')} icon={icon} />;
}


export function BullseyeMarker(props: MarkerProps) {
  const { draggable } = props;
  const position = props.position as LatLng;

  const memorizedItem = useMemo(() => <BullseyeMarkerNonMemo {...props} />, [position.lat, position.lng, draggable]); // eslint-disable-line react-hooks/exhaustive-deps

  return memorizedItem;
}
