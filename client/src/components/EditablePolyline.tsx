import React from 'react';
import { Polyline as CorePolyline, LeafletEvent, LatLng } from 'leaflet';
import { Polyline, PolylineProps } from 'react-leaflet';
import { omit } from 'lodash';

import { Point, Group, StaticPoint } from '../models';
import { gameService } from '../services';

export type EditablePolylineProps = PolylineProps & {
  group: Group;
};

export type EditablePolylineState = {
  visible: boolean,
  group: Group,
  line?: CorePolyline
}

function is_same_point (poly_point: LatLng, unit_point: Point): boolean {
  return poly_point.lat === unit_point.lat && poly_point.lng === unit_point.lon;
}

export class EditablePolyline extends React.Component<EditablePolylineProps, EditablePolylineState> {
    constructor(props: EditablePolylineProps) {
      super(props);
      this.state = {
        visible: true,
        group: props.group
    };    

      this.onPolylineAdded = this.onPolylineAdded.bind(this);
      this.handle_point_modified = this.handle_point_modified.bind(this);
      this.handle_point_inserted = this.handle_point_inserted.bind(this);
      this.handle_point_removed = this.handle_point_removed.bind(this);      
      this.redraw = this.redraw.bind(this);     
      this.componentDidUpdate = this.componentDidUpdate.bind(this);           
    }

    redraw() {
      this.setState({...this.state, visible: false}); 
      this.setState({...this.state, visible: true}); 
    }

    onPolylineAdded(event: LeafletEvent): void { 
      const line = event.target as CorePolyline; 
      this.setState({...this.state, line: line}); 
     
      line.pm.enable({
        allowSelfIntersections: true
      });
  
      line.pm._markers[0].dragging.disable();
      line.on("pm:edit", event => {  
        let latLngs = line.getLatLngs() as LatLng[];
        if (latLngs.length < this.state.group.points.length) {
          this.handle_point_removed();
        }
      });
  
      line.on('pm:markerdragend', event => {      
        let latLngs = line.getLatLngs() as LatLng[];
        let num_of_points_changed = latLngs.length !== this.state.group.points.length;
  
        if (num_of_points_changed) {
          if (latLngs.length > this.state.group.points.length) {
            this.handle_point_inserted();          
          }
        } else {
          this.handle_point_modified();
        }
      });
    }

    handle_point_modified(): void {
      if (this.state.line === undefined) {
        return;
      }
      const polyline: CorePolyline = this.state.line;

      const unit = this.state.group;
      const is_modified = (point: LatLng): boolean => unit.points.some((unit): boolean => is_same_point(point, unit.position)) === false;
    
      let latLngs = polyline.getLatLngs() as LatLng[];
      let modified_poly_array = latLngs.filter((poly_point: LatLng) => is_modified(poly_point));
      if (modified_poly_array === undefined || modified_poly_array.length !== 1) {
        console.error("Invalid modified_poly_array.length");
        return;
      }
      let modified_poly_point = modified_poly_array[0];
    
      let modified_unit_array = unit.points.filter(unit_point => latLngs.some(poly_point => is_same_point(poly_point, unit_point.position)) === false);
      if (modified_unit_array === undefined || modified_unit_array.length !== 1) {
        console.error("Invalid modified_unit_array.length");
        return;
      }
      let modified_unit_point = modified_unit_array[0];
    
      const modified_unit_point_index = unit.points.findIndex(unit_point => unit_point.position.lat === modified_unit_point.position.lat && unit_point.position.lon === modified_unit_point.position.lon);
    
      let old_point = JSON.parse(JSON.stringify(unit.points[modified_unit_point_index]));
      unit.points[modified_unit_point_index].position.lat = modified_poly_point.lat;
      unit.points[modified_unit_point_index].position.lon = modified_poly_point.lng;
      // TODO alt
      gameService.sendRouteModify(unit, old_point.position, unit.points[modified_unit_point_index].position);
    
      console.log("Point modified.");  
    };
    
    handle_point_inserted(): void { 
      if (this.state.line === undefined) {
        return;
      }
      const polyline: CorePolyline = this.state.line;

      const unit = this.state.group;
      const is_new_point = (point: LatLng) => unit.points.some(unit_point => is_same_point(point, unit_point.position)) === false;
    
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
      new_unit_point.position.lat = new_point.lat;
      new_unit_point.position.lon = new_point.lng;
      // TODO alt
    
      gameService.sendRouteInsertAt(unit, new_unit_point.position, at.position);
    
      console.log("New point created.");       
    };
    
    handle_point_removed(): void { 
      if (this.state.line === undefined) {
        return;
      }
      const polyline: CorePolyline = this.state.line;
      
      const unit = this.state.group;

      let latLngs = polyline.getLatLngs() as LatLng[];
      if (latLngs.length === 0) {
        // Note: Temporary limitation, UI can't add new WP without polyline now
        console.log("Last WP cannot be removed!");   
        this.redraw();
        return;
      }
      
      const polyline_contains = (point: Point) => latLngs.some(poly_point => is_same_point(poly_point, point));
      let new_point_array = unit.points.filter((unit_point: StaticPoint) => polyline_contains(unit_point.position) === false);
      if (new_point_array === undefined || new_point_array.length !== 1) {
        console.error("Invalid new_point_array.length");
        return;
      }
      let new_point = new_point_array[0];
    
      gameService.sendRouteRemove(unit, new_point.position);  
      
      console.log("Point removed");        
    }

    componentDidUpdate(prevProps: EditablePolylineProps) {
      if (prevProps !== this.props) {
        this.setState({ visible: this.state.visible, group: this.props.group});       
        setTimeout(this.redraw, 10); // Needed for sync with other clients, redraw has no effect wihtin this function           
      }
    }

    render() {
      if (this.state.visible) {
        return (            
            <Polyline {...omit(this.props, 'onadd')} onadd={this.onPolylineAdded} />        
        );
      }
      else
      {
        return (            
          <div></div>
      );        
      }
    }
};
