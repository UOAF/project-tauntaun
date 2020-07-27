let lat0 = 43;
let lon0 = 41;

let Maybe = folktale.data.Maybe;

let theater_map = L.map("mapid").setView([lat0, lon0], 9);
L.PM.initialize({ optIn: false });

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

theater_map.on('click', function(e) {          
  let location = e.latlng;
  if (typeof master_mode.map_on_click === "function")
  {    
    master_mode.map_on_click(location);
  }  
});

function Unit(unit_info) {
  this.info = unit_info;

  this.is_underway = () => {
    return unit_info.points[0].action == "Turning Point";
  };

  this.update_info = (new_info) => {
    this.info = new_info;
    this.maybe_marker.map((m) => {
      m.route_polyline.removeFrom(theater_map);
      m.route_polyline = EditRouteMode.render_route(new_info)
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
    m.options.name = 'unit_marker';
    let p = L.popup();
    p.setContent(unit_info.name);

    m.selected = false;
    m.on("click", (event) => {
      if (typeof master_mode.marker_on_click === "function")
      {
        master_mode.marker_on_click(m, unit_info);
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
