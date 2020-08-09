import React from 'react';
import ms from 'milsymbol';
import { Icon, Marker as CoreMarker, LeafletEvent } from 'leaflet';
import { Marker, Popup } from 'react-leaflet';

import { Group } from '../models';

export type GroupProps = {
  group: Group;
  groupMarkerOnClick?: (group: Group) => void;
};

export function GroupMarker(props: GroupProps) {
  const { group, groupMarkerOnClick } = props;

  const { lat, lon: lng } = group.units[0].position;
  const symbol = new ms.Symbol(group.units[0].sidc, { size: 20 });
  const anchor = symbol.getAnchor();
  const icon = new Icon({
    iconUrl: symbol.toDataURL(),
    iconAnchor: [anchor.x, anchor.y]
  });

  const onMarkerAdded = (event: LeafletEvent) => {
    const marker = event.target as CoreMarker;
    marker.pm.disable();
  };

  const onClick = () => {
    if (groupMarkerOnClick) {
      groupMarkerOnClick(group);
    }
  };

  return (
    <Marker position={{ lat, lng }} onadd={onMarkerAdded} icon={icon} onClick={onClick}>
      <Popup>{group.name}</Popup>
    </Marker>
  );
}
