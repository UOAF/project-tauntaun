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
  
  function send_route_insert_at(unit, new_wp, at_wp) { 
    data = {
      key: "unit_route_insert_at",
      value: {
        id: unit.id,
        name: unit.name,
        new: {lat: new_wp.lat, lon: new_wp.lon},
        at: {lat: at_wp.lat, lon: at_wp.lon},
      },
    };
    update_ws.send(JSON.stringify(data));
  }
  
  function send_route_remove(unit, wp) {
    data = {
      key: "unit_route_remove",
      value: {
        id: unit.id,
        name: unit.name,
        point: {lat: wp.lat, lon: wp.lon}
      },
    };
    update_ws.send(JSON.stringify(data));
  }
  
  function send_route_modify(unit, old_wp, new_wp) {
    data = {
      key: "unit_route_modify",
      value: {
        id: unit.id,
        name: unit.name,
        old: {lat: old_wp.lat, lon: old_wp.lon},
        new: {lat: new_wp.lat, lon: new_wp.lng}
      },
    };
    update_ws.send(JSON.stringify(data));
  }

  function send_save_mission() {
    data = {
      key: "save_mission",
      value: ""
    };
    update_ws.send(JSON.stringify(data));
}