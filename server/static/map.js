let lat0 = 43;
let lon0 = 41;

let Maybe = folktale.data.Maybe;

// var Maybe = require('data.maybe');

let theater_map = L.map("mapid").setView([lat0, lon0], 9);
L.PM.initialize({ optIn: false });

let update_ws_url = new URL("/ws/update", window.location.href);
update_ws_url.protocol = update_ws_url.protocol.replace("http", "ws");
let update_ws = new WebSocket(update_ws_url);
update_ws.onopen = (event) => {
  console.log("OPEN!!!");
};

update_ws.onmessage = (event) => {
  let message = JSON.parse(event.data);
  handlers = {
    unit_group_updated: (info) => {
      let maybe_unit = all_units.getById(info.id);
      maybe_unit.map((unit) => {
        unit.update_info(info);
      });
      console.log(maybe_unit);
    },
  };
  let handler = handlers[message.key];
  handler(message.value);
};

L.tileLayer(
  "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}@2x.png?access_token=pk.eyJ1IjoiYm9ibW9yZXR0aSIsImEiOiJjazI4amV6eWswaWF2M2JtYjh3dmowdnQ1In0.XutSpPpaRm9LZudTNgVZwQ",
  {
    maxZoom: 13,
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: "bobmoretti.3zp0vycr",
  }
).addTo(theater_map);

function render_route(unit_info) {
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
  polyline.on("pm:markerdragend", (e) => {
    let num_of_points_changed = polyline._latlngs.length != unit_info.points.length;

    if (num_of_points_changed) {
        const is_same_point = (poly_point, unit_point) => poly_point.lat == unit_point.lat && poly_point.lng == unit_point.lon;        

        if (polyline._latlngs.length > unit_info.points.length)
        {
            console.log("New point created.");

            const is_new_point = point => unit_info.points.some(unit_point => is_same_point(point, unit_point)) == false;

            let new_point = polyline._latlngs.filter(poly_point => is_new_point(poly_point));
            if (new_point.length != 1) {
              console.error("Invalid new_point.length");
              return;
            }
            new_point = new_point[0];

            const new_point_index = polyline._latlngs.findIndex(poly_point => poly_point.lat == new_point.lat && poly_point.lng == new_point.lng);            

            const prev_index = new_point_index - 1;
            if (prev_index == -1) {
              console.error("Illegal event: not possible to insert new waypoint before the first one!");
              return;
            }

            // TODO Temporary solution, copy the previous point                
            let clone = JSON.parse(JSON.stringify(unit_info.points[prev_index]));
            clone.lat = new_point.lat;
            clone.lon = new_point.lng;
            // TODO alt
            const new_index = prev_index + 1;
            unit_info.points.splice(new_index, 0, clone);            
        }
        else
        {
            console.log("Point removed, not implemented.");   
        }
    } else {
        console.log("Point changed");
        unit_info.points.forEach((point, idx) => {
           let marker_pos = polyline._latlngs[idx];
           point.lat = marker_pos.lat;
           point.lon = marker_pos.lng;
           // TODO alt
        });
    }

    send_route_update(unit_info);
  });
  return polyline;
}

function send_route_update(unit) {
  data = {
    key: "unit_route_updated",
    value: {
      id: unit.id,
      name: unit.name,
      points: unit.points.map((p) => {
        return {
          lat: p.lat,
          lon: p.lon,
        };
      }),
    },
  };
  update_ws.send(JSON.stringify(data));
}

function Unit(unit_info) {
  this.info = unit_info;

  this.is_underway = () => {
    return unit_info.points[0].action == "Turning Point";
  };

  this.update_info = (new_info) => {
    this.info = new_info;
    this.maybe_marker.map((m) => {
      m.route_polyline.removeFrom(theater_map);
      m.route_polyline = render_route(new_info);
    });
  };

  this.render_marker = () => {
    let symbol = new ms.Symbol(unit_info.sidc, { size: 20 });

    let icon = L.icon({
      iconUrl: symbol.toDataURL(),
      iconAnchor: [symbol.getAnchor().x, symbol.getAnchor().y],
    });

    let latlon = [unit_info.position.lat, unit_info.position.lon];

    let m = L.marker(latlon, { icon: icon, draggable: false });
    let p = L.popup();
    p.setContent(unit_info.name);

    m.selected = false;
    m.on("click", (event) => {
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
        m.route_polyline = render_route(unit_info);
      } else {
        m.selected = false;
        m.route_polyline.removeFrom(theater_map);
        delete m.route_polyline;
      }
    });
    m.addTo(theater_map);
    return m;
  };

  this.maybe_marker = this.is_underway()
    ? Maybe.Just(this.render_marker())
    : Maybe.Nothing();
}

function UnitSet() {
  this.units = {};

  this.addFromInfo = (unit_info) => {
    this.units[unit_info.id] = new Unit(unit_info);
  };

  this.getById = (id) => {
    return Maybe.fromNullable(this.units[id]);
  };

  this.getByName = (name) => {
    return Maybe.fromNullable(this.units.find((unit) => unit.name === name));
  };

  this.forEach = (apply_to) => {
    for (unit_id in this.units) {
      let unit = this.units[unit_id];
      console.log(unit);
      apply_to(unit);
    }
  };

  //    function
}

let all_units = new UnitSet();

function is_underway(unit) {
  return unit.points[0].action == "Turning Point";
}

function add_unit(unit_info) {
  console.log("HELLO");
  console.log(all_units);
  all_units.addFromInfo(unit_info);
}

function render_plane_groups(groups) {
  groups.forEach((unit) => {
    all_units.add(unit);
    if (is_underway(unit)) {
      render_unit(unit);
    }
  });
}

function fetch_json(url) {
  return fetch(url).then((response) => {
    return response.json();
  });
}

fetch_json("game/ships/blue")
  .then((ships) => {
    ships.forEach(add_unit);
  })
  .catch((err) => {
    console.warn("Error rendering ships ", err);
  });

fetch_json("game/plane_groups/blue")
  .then((blue_plane_data) => {
    return blue_plane_data.forEach(add_unit);
  })
  .catch((err) => {
    console.warn("there was an error");
    console.warn(err);
  });
