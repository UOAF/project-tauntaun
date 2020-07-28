import React from 'react';
import { Polyline as CorePolyline, LeafletEvent, LatLng } from 'leaflet';
import { Polyline, PolylineProps } from 'react-leaflet';
import { omit } from 'lodash';

import { Unit, Point, AppStateContainer } from '../models';
import { gameService } from '../services';

export type EditablePolylineProps = PolylineProps & {
  unit: Unit;
};

type AppStateReturnType = ReturnType<typeof AppStateContainer.useContainer>;

function redrawUnit(unit: Unit, appState: AppStateReturnType) {
  unit.isSelected = false;    
  appState.updateUnit(unit);
  unit.isSelected = true;    
  appState.updateUnit(unit);
}

function is_same_point (poly_point: LatLng, unit_point: Point): boolean {
  return poly_point.lat === unit_point.lat && poly_point.lng === unit_point.lon;
}

function handle_point_modified(polyline: CorePolyline, unit: Unit): void {
  const is_modified = (point: LatLng): boolean => unit.points.some((unit): boolean => is_same_point(point, unit)) === false;

  let latLngs = polyline.getLatLngs() as LatLng[];
  let modified_poly_array = latLngs.filter((poly_point: LatLng) => is_modified(poly_point));
  if (modified_poly_array === undefined || modified_poly_array.length !== 1) {
    console.error("Invalid modified_poly_array.length");
    return;
  }
  let modified_poly_point = modified_poly_array[0];

  let modified_unit_array = unit.points.filter(unit_point => latLngs.some(poly_point => is_same_point(poly_point, unit_point)) === false);
  if (modified_unit_array === undefined || modified_unit_array.length !== 1) {
    console.error("Invalid modified_unit_array.length");
    return;
  }
  let modified_unit_point = modified_unit_array[0];

  const modified_unit_point_index = unit.points.findIndex(unit_point => unit_point.lat === modified_unit_point.lat && unit_point.lon === modified_unit_point.lon);

  let old_point = JSON.parse(JSON.stringify(unit.points[modified_unit_point_index]));
  unit.points[modified_unit_point_index].lat = modified_poly_point.lat;
  unit.points[modified_unit_point_index].lon = modified_poly_point.lng; // TODO setstate?
  // TODO alt
  gameService.sendRouteModify(unit, old_point, unit.points[modified_unit_point_index]);

  console.log("Point modified.");  
};

function handle_point_inserted(polyline: CorePolyline, unit: Unit) { 
  const is_new_point = (point: LatLng) => unit.points.some(unit_point => is_same_point(point, unit_point)) === false;

  let latLngs = polyline.getLatLngs() as LatLng[];
  let new_point_array = latLngs.filter(poly_point => is_new_point(poly_point));
  if (new_point_array === undefined || new_point_array.length !== 1) {
    console.error("Invalid new_point_array.length " + new_point_array.length);
    return;
  }
  let new_point = new_point_array[0];
  
  const new_point_index = latLngs.findIndex(poly_point => poly_point.lat === new_point.lat && poly_point.lng === new_point.lng);            

  // TODO Temporary solution, copy the previous point
  let at = JSON.parse(JSON.stringify(unit.points[new_point_index]));
  let new_unit_point = JSON.parse(JSON.stringify(unit.points[new_point_index - 1]));    
  new_unit_point.lat = new_point.lat;
  new_unit_point.lon = new_point.lng;
  // TODO alt

  gameService.sendRouteInsertAt(unit, new_unit_point, at);

  console.log("New point created.");       
};

function handle_point_removed(polyline: CorePolyline, unit: Unit, appState: AppStateReturnType) { 
  let latLngs = polyline.getLatLngs() as LatLng[];
  if (latLngs.length === 0) {
    // Note: Temporary limitation, UI can't add new WP without polyline now
    console.log("Last WP cannot be removed!");        
    redrawUnit(unit, appState);
    return;
  }
  
  const polyline_contains = (point: Point) => latLngs.some(poly_point => is_same_point(poly_point, point));
  let new_point_array = unit.points.filter((unit_point: Point) => polyline_contains(unit_point) === false);
  if (new_point_array === undefined || new_point_array.length !== 1) {
    console.error("Invalid new_point_array.length");
    return;
  }
  let new_point = new_point_array[0];

  gameService.sendRouteRemove(unit, new_point);  
  
  console.log("Point removed");        
}

// TODO Hack to get around polyline is not recreated when state is changed
// TODO Remove not handled 
let unitMap: { [id: string] : Unit; } = {};

export function EditablePolyline(props: EditablePolylineProps) {
  const { onadd: hookedOnAdd, unit } = props;

  const appState = AppStateContainer.useContainer();

  const onPolylineAdded = (event: LeafletEvent) => {
    const line = event.target as CorePolyline;    
    unitMap[unit.id] = unit;

    line.pm.enable({
      allowSelfIntersections: true
    });

    line.pm._markers[0].dragging.disable();
    line.on("pm:edit", event => {  
      let latLngs = line.getLatLngs() as LatLng[];
      if (latLngs.length < unitMap[unit.id].points.length) {
        handle_point_removed(line, unitMap[unit.id], appState);
      }
    });

    line.on('pm:markerdragend', event => {      
      let latLngs = line.getLatLngs() as LatLng[];
      let num_of_points_changed = latLngs.length !== unitMap[unit.id].points.length;

      if (num_of_points_changed) {
        if (latLngs.length > unitMap[unit.id].points.length) {
          handle_point_inserted(line, unitMap[unit.id]);          
        }
      } else {
        handle_point_modified(line, unitMap[unit.id]);
      }
    });

    if (hookedOnAdd) {
      hookedOnAdd(event);
    }
  };

  if (unitMap[unit.id] !== undefined)
  {    
    unitMap[unit.id] = unit;
  }  

  return <Polyline {...omit(props, 'onadd')} onadd={onPolylineAdded} />;
}
