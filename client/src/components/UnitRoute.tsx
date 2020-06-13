import React from 'react';
import { Polyline } from 'react-leaflet';
import { LeafletEvent, Polyline as CorePolyline, LatLng } from 'leaflet';

import { Unit, Point } from '../models/unit';
import { gameService } from '../services/gameService';

export type UnitRouteProps = {
  unit: Unit;
};

export function UnitRoute(props: UnitRouteProps) {
  const { unit } = props;
  const positions = unit.points.map(point => ({ lat: point.lat, lng: point.lon }));

  const onPolylineAdded = (event: LeafletEvent) => {
    const line = event.target as CorePolyline;
    line.pm.enable({
      allowSelfIntersections: true
    });

    line.pm._markers[0].dragging.disable();
    line.on('pm:markerdragend', event => {
      unit.points = unit.points.map((point: Point, index: number) => {
        const latLngs = line.getLatLngs() as LatLng[];
        point.lat = latLngs[index].lat;
        point.lon = latLngs[index].lng;
        return point;
      });

      gameService.updateUnitRoute(unit);
      console.info(`dragged point`, unit);
    });
  };

  return <Polyline positions={positions} onadd={onPolylineAdded} color="#2d4687" stroke={true} />;
}
