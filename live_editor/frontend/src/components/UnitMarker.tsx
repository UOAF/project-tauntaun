import React from 'react';

import { Unit } from '../models';
import { DcsSidcMarker } from '.';

export type UnitProps = {
  unit: Unit;
  label?: string;
  unitMarkerOnClick?: (unit: Unit) => void;
};

export function UnitMarker(props: UnitProps) {
  const { unit, label, unitMarkerOnClick } = props;

  const { lat, lon: lng } = unit.position;

  const onClick = () => {
    if (unitMarkerOnClick) {
      unitMarkerOnClick(unit);
    }
  };

  return (
    <DcsSidcMarker
      sidc={''}
      position={{ lat, lng }}
      type={unit.type}
      name={label ? label : unit.name}
      onclick={onClick}
    />
  );
}
