import React from 'react';

import { Unit } from '../models/unit';
import { Polyline } from 'react-leaflet';

export type UnitRouteProps = {
  unit: Unit;
};

export function UnitRoute(props: UnitRouteProps) {
  const { unit } = props;
  const positions = unit.points.map(point => ({ lat: point.lat, lng: point.lon }));

  return <Polyline positions={positions} color="#2d4687" stroke={true} />;
}
