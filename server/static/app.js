Vue.component('v-select', VueSelect.VueSelect);

class BaseMasterMode {
  enter() {}
  exit() {}
}

class NoneMode extends BaseMasterMode { 
  constructor() {
    super();
    this.name = 'NONE';
  }
}

class EditRouteMode extends BaseMasterMode {
  constructor() {
    super();
    this.name = 'EDIT_ROUTE';
  }

  exit() {
    this.deselect_all_markers();
  }

  marker_on_click(m, unit_info) {
    if (!m.selected) {
      // not selected, so it's time to select.
      // First deselect all markers on the map.
      all_units.forEach((unit) => {
        console.log(unit);
        let maybe_marker = unit.maybe_marker;
        maybe_marker.map((marker) => {
          if (marker.selected) {
            marker.selected = false;
            if ("route_polyline" in marker) {
              marker.route_polyline.removeFrom(theater_map);
              marker.route_polyline = null;
            }
          }
        });
      });
      // Now select this one.
      m.selected = true;
      m.route_polyline = this.render_route(unit_info);
    } else {
      this.deselect_marker(m);
    }      
  }

  deselect_marker(m) {
    if (m.selected)
    {
      m.selected = false;
      m.route_polyline.removeFrom(theater_map);
      delete m.route_polyline;
    }
  }

  deselect_all_markers() { 
    const deselect_marker_proxy = this.deselect_marker;
    theater_map.eachLayer(function (layer) { 
      if (layer.options.name === 'unit_marker') {
        deselect_marker_proxy(layer);
      }         
  });
  }

  render_route(unit_info) {
    function redraw_polyline() {
      let maybe_unit = all_units.getById(unit_info.id);
      maybe_unit.map((unit) => {
        unit.update_info(unit.info);
      });    
    }
    function is_same_point (poly_point, unit_point) {
      return poly_point.lat == unit_point.lat && poly_point.lng == unit_point.lon;
    }
    function handle_point_removed() { 
      if (polyline._latlngs.length == 0) {
        // Note: Temporary limitation, UI can't add new WP without polyline now
        console.log("Last WP cannot be removed!");            
        redraw_polyline();
        return;
      }
      
      const polyline_contains = point => polyline._latlngs.some(poly_point => is_same_point(poly_point, point));
      let new_point = unit_info.points.filter(unit_point => polyline_contains(unit_point) == false);
      if (new_point === undefined || new_point.length != 1) {
        console.error("Invalid new_point.length");
        return;
      }
      new_point = new_point[0];
  
      const new_point_index = unit_info.points.findIndex(unit_point => new_point.lat == unit_point.lat && new_point.lon == unit_point.lon);
  
      unit_info.points.splice(new_point_index, 1);
      send_route_remove(unit_info, new_point);
      
      console.log("Point removed");       
    }
    function handle_point_added() { 
      const is_new_point = point => unit_info.points.some(unit_point => is_same_point(point, unit_point)) == false;
      let new_point = polyline._latlngs.filter(poly_point => is_new_point(poly_point));
      if (new_point === undefined || new_point.length != 1) {
        console.error("Invalid new_point.length");
        return;
      }
      new_point = new_point[0];
  
      const new_point_index = polyline._latlngs.findIndex(poly_point => poly_point.lat == new_point.lat && poly_point.lng == new_point.lng);            
  
      // TODO Temporary solution, copy the previous point
      let at = JSON.parse(JSON.stringify(unit_info.points[new_point_index]));
      let new_unit_point = JSON.parse(JSON.stringify(unit_info.points[new_point_index - 1]));    
      new_unit_point.lat = new_point.lat;
      new_unit_point.lon = new_point.lng;
      // TODO alt
  
      unit_info.points.splice(new_point_index, 0, new_unit_point);
      send_route_insert_at(unit_info, new_unit_point, at);
  
      console.log("New point created.");      
    };
    function handle_point_modified() {      
      const is_modified = point => unit_info.points.some(unit_point => is_same_point(point, unit_point)) == false;
  
      let modified_poly_point = polyline._latlngs.filter(poly_point => is_modified(poly_point));
      if (modified_poly_point === undefined || modified_poly_point.length != 1) {
        console.error("Invalid modified_poly_point.length");
        return;
      }
      modified_poly_point = modified_poly_point[0];
  
      let modified_unit_point = unit_info.points.filter(unit_point => polyline._latlngs.some(poly_point => is_same_point(poly_point, unit_point)) == false);
      if (modified_unit_point === undefined || modified_unit_point.length != 1) {
        console.error("Invalid modified_unit_point.length");
        return;
      }
      modified_unit_point = modified_unit_point[0];
  
      const modified_unit_point_index = unit_info.points.findIndex(unit_point => unit_point.lat == modified_unit_point.lat && unit_point.lon == modified_unit_point.lon);            
  
      let old_point = JSON.parse(JSON.stringify(unit_info.points[modified_unit_point_index]));  
      unit_info.points[modified_unit_point_index].lat = modified_poly_point.lat;
      unit_info.points[modified_unit_point_index].lon = modified_poly_point.lng;
      // TODO alt
      send_route_modify(unit_info, old_point, modified_poly_point);
  
      console.log("Point modified.");
    };
  
    let latlons = unit_info.points.map((p) => [p.lat, p.lon]);
    let polyline = L.polyline(latlons, {
      color: "#2d4687",
      stroke: 1,
      pmIgnore: false,
    });
  
    polyline.addTo(theater_map);
    polyline.on("pm:markerdragstart", (e) => {
      // console.log('dragging!', e);
    });
  
    polyline.pm.enable({ allowSelfIntersection: true });  
    polyline.pm._markers[0].dragging.disable();
    polyline.on("pm:edit", (e) => {  
      switch (master_mode) {
        case master_modes.EDIT_ROUTE:
          {
            if (polyline._latlngs.length < unit_info.points.length) {
              handle_point_removed();
            }             
            break;
          }        
        default:
      }
    });
  
    polyline.on("pm:markerdragend", (e) => {
      switch (master_mode) {
        case master_modes.EDIT_ROUTE:
          {    
            let num_of_points_changed = polyline._latlngs.length != unit_info.points.length;
  
            if (num_of_points_changed) {
              if (polyline._latlngs.length > unit_info.points.length) {
                handle_point_added();
              } 
            } else {
              handle_point_modified();
            }
            break;          
          }
          default:
          }        
    });
    return polyline;
  }
}

class AddFlightMode extends BaseMasterMode { 
  constructor() {
    super();
    this.name = 'ADD_FLIGHT';
  }

  enter() {
    add_flight_form.visible = false;
  }

  exit() {
    add_flight_form.visible = false;
  }

  map_on_click(location) {    
    add_flight_form.visible = true;
  }
}

const master_modes = {
  NONE: new NoneMode(),
  EDIT_ROUTE: new EditRouteMode(),
  ADD_FLIGHT: new AddFlightMode()
};

let master_mode = master_modes.NONE;

let app = new Vue({
    el: '#app',
    data: {
      mode_text: "test"
    },
    methods: {
      saveMission: function () {
        send_save_mission();
      },
      enterAddFlightMode: function () {
       enter_mode(master_modes.ADD_FLIGHT);
      },
      enterEditRouteMode: function () {
        enter_mode(master_modes.EDIT_ROUTE);
      },
    }
  });

let add_flight_form = new Vue(
  {
    el: '#add_flight_form',
    data: {
      visible: false,
      airbase: ['1', '2', '3'],
      airframe: ['1', '2', '3'],
      number: 2,
    },
    methods: {
      add_flight: function () {
        //https://vue-select.org/guide/values.html#transforming-selections
        console.log(this.airbase);
      }
    }
  }
);

function enter_mode(mode) {
  console.log("Changing mode from " + master_mode.name + " to " + mode.name);
  master_mode.exit();
  master_mode = mode;
  mode.enter();
  app.mode_text = mode.name;
}

enter_mode(master_modes.EDIT_ROUTE);
