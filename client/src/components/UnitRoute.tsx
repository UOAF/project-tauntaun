import React from 'react';

import { EditablePolyline } from './EditablePolyline';
import { Unit } from '../models/unit';

export type UnitRouteProps = {
  unit: Unit;
};

export function UnitRoute(props: UnitRouteProps) {
  const { unit } = props;
  const positions = unit.points.map(point => ({ lat: point.lat, lng: point.lon }));

  return <EditablePolyline unit={unit} positions={positions} color="#2d4687" stroke={true} />;
}
