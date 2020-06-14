import React from 'react';
import { Polyline as CorePolyline, LeafletEvent, LatLng } from 'leaflet';
import { Polyline, PolylineProps } from 'react-leaflet';
import { omit } from 'lodash';

import { Unit, Point } from '../models/unit';
import { gameService } from '../services/gameService';

export type EditablePolylineProps = PolylineProps & {
  unit: Unit;
};

export function EditablePolyline(props: EditablePolylineProps) {
  const { onadd: hookedOnAdd, unit } = props;

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

    if (hookedOnAdd) {
      hookedOnAdd(event);
    }
  };

  return <Polyline {...omit(props, 'onadd')} onadd={onPolylineAdded} />;
}
