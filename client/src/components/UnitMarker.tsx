import React from 'react';
import ms from 'milsymbol';

import { Unit } from '../models/unit';
import { Icon } from 'leaflet';
import { Marker, Popup } from 'react-leaflet';

export type UnitProps = {
  unit: Unit;
  toggleUnitSelection?: (unit: Unit) => void;
};

export function UnitMarker(props: UnitProps) {
  const changeSelectedUnit = (unit: Unit) => {
    if (props.toggleUnitSelection) {
      props.toggleUnitSelection(unit);
    }
  };

  const { unit } = props;

  const { lat, lon: lng } = unit.position;
  const symbol = new ms.Symbol(unit.sidc, { size: 20 });
  const anchor = symbol.getAnchor();
  const icon = new Icon({
    iconUrl: symbol.toDataURL(),
    iconAnchor: [anchor.x, anchor.y]
  });

  return (
    <Marker position={{ lat, lng }} icon={icon} onClick={() => changeSelectedUnit(unit)}>
      <Popup>{unit.name}</Popup>
    </Marker>
  );
}
