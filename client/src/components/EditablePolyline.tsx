import React from 'react';
import { Polyline as CorePolyline, LeafletEvent, LatLng } from 'leaflet';
import { Polyline, PolylineProps } from 'react-leaflet';
import { omit } from 'lodash';

import { Unit, Point } from '../models';
import { gameService } from '../services';

export type EditablePolylineProps = PolylineProps & {
  unit: Unit;
};

function is_same_point (poly_point: LatLng, unit_point: Point): boolean {
  return poly_point.lat === unit_point.lat && poly_point.lng === unit_point.lon;
}

function handle_point_modified(polyline: CorePolyline, unit: Unit): void {
  const is_modified = (point: LatLng): boolean => unit.points.some((unit): boolean => is_same_point(point, unit)) === false;

  let modified_poly_array = (polyline.getLatLngs() as LatLng[]).filter((poly_point: LatLng) => is_modified(poly_point));
  if (modified_poly_array === undefined || modified_poly_array.length !== 1) {
    console.error("Invalid modified_poly_array.length");
    return;
  }
  let modified_poly_point = modified_poly_array[0];

  let modified_unit_array = unit.points.filter(unit_point => (polyline.getLatLngs() as LatLng[]).some(poly_point => is_same_point(poly_point, unit_point)) === false);
  if (modified_unit_array === undefined || modified_unit_array.length !== 1) {
    console.error("Invalid modified_unit_array.length");
    return;
  }
  let modified_unit_point = modified_unit_array[0];

  const modified_unit_point_index = unit.points.findIndex(unit_point => unit_point.lat === modified_unit_point.lat && unit_point.lon === modified_unit_point.lon);

  let old_point = JSON.parse(JSON.stringify(unit.points[modified_unit_point_index]));
  unit.points[modified_unit_point_index].lat = modified_poly_point.lat;
  unit.points[modified_unit_point_index].lon = modified_poly_point.lng;
  // TODO alt
  gameService.sendRouteModify(unit, old_point, unit.points[modified_unit_point_index]);

  console.log("Point modified.");
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
      // TODO extract (line.getLatLngs() as LatLng[]), entire file
      let num_of_points_changed = (line.getLatLngs() as LatLng[]).length !== unit.points.length;

      if (num_of_points_changed) {
        if ((line.getLatLngs() as LatLng[]).length > unit.points.length) {
          //handle_point_added();
        }
      } else {
        handle_point_modified(line, unit);
      }
    });

    console.log("onPolylineAdded");

    if (hookedOnAdd) {
      hookedOnAdd(event);
    }
  };

  return <Polyline {...omit(props, 'onadd')} onadd={onPolylineAdded} />;
}
