
var lat0 = 43;
var lon0 = 41;

var theater_map = L.map('mapid').setView([lat0, lon0], 9);
L.PM.initialize({ optIn: false });

var unit_markers = [];
var update_ws_url = new URL('/ws/update', window.location.href);
update_ws_url.protocol = update_ws_url.protocol.replace('http', 'ws');
var update_ws = new WebSocket(update_ws_url)
update_ws.onopen = (event) => {
    console.log("OPEN!!!");
};

update_ws.onmessage = (event) => {
    console.log("DATA", event);
;}

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}@2x.png?access_token=pk.eyJ1IjoiYm9ibW9yZXR0aSIsImEiOiJjazI4amV6eWswaWF2M2JtYjh3dmowdnQ1In0.XutSpPpaRm9LZudTNgVZwQ', {
    maxZoom: 13,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'bobmoretti.3zp0vycr'
}).addTo(theater_map);



function is_underway(unit) {
    return unit.points[0].action == "Turning Point";
}



function render_route(unit) {
    var latlons = unit.points.map((p) => [p.lat, p.lon]);
    var polyline = L.polyline(latlons, {
        color: '#2d4687',
        stroke: 1,
        pmIgnore: false
    });
    polyline.addTo(theater_map);
    polyline.on('pm:markerdragstart', (e) => {
        // console.log('dragging!', e);
    })
    return polyline;
}

function send_route_update(unit) {
    data = {
        'key': 'unit_route_updated',
        'value': {
            'id': unit.id,
            'name': unit.name,
            'points': unit.points.map((p) => {
                return {
                    'lat': p.lat, 'lon': p.lon
                }
            }),
        }
    };
    update_ws.send(JSON.stringify(data));
}

function render_unit(unit) {
    var symbol = new ms.Symbol(unit.sidc, { size: 20 });

    var icon = L.icon({
        iconUrl: symbol.toDataURL(),
        iconAnchor: [symbol.getAnchor().x, symbol.getAnchor().y]
    })

    var latlon = [unit.position.lat, unit.position.lon];

    var m = L.marker(latlon, { icon: icon, draggable: false })
    var p = L.popup();
    p.setContent(unit.name)
    p.marker = m;
    p.unit = unit;
    //m.bindPopup(p).openPopup();
    m.selected = false;
    m.on('click', (event) => {
        if (!m.selected) {
            // not selected, so it's time to select.
            // First deselect all markers on the map.
            unit_markers.forEach((marker) => {
                if (marker.selected) {
                    marker.selected = false;
                    if ('route_polyline' in marker) {
                        marker.route_polyline.removeFrom(theater_map);
                        marker.route_polyline = null;
                    }
                }
            });
            // Now select this one.
            m.selected = true;
            m.route_polyline = render_route(unit);
            m.route_polyline.pm.enable({ 'allowSelfIntersection': true })
            m.route_polyline.pm._markers[0].dragging.disable();
            m.route_polyline.on('pm:markerdragend', (e) => {
                unit.points.forEach((point, idx) => {
                    var marker_pos = m.route_polyline._latlngs[idx];
                    point.lat = marker_pos.lat;
                    point.lon = marker_pos.lng;
                });

                send_route_update(unit);
            });

        } else {
            m.selected = false;
            m.route_polyline.removeFrom(theater_map);
            delete m.route_polyline;
        }
    });
    unit_markers.push(m);
    m.addTo(theater_map);
}


function render_plane_groups(groups) {
    groups.forEach(render_unit);
}

function fetch_json(url) {
    return fetch(url).then(response => {
        return response.json();
    })
}

fetch_json('game/ships/blue').then(ships => {
    ships.forEach(render_unit);
}).catch(err => {
    console.warn("Error rendering ships ", err);
});

fetch_json('game/plane_groups/blue').then(blue_plane_data => {
    console.log(blue_plane_data);
    return blue_plane_data.filter((group) => is_underway(group)).forEach(render_unit);
}).catch(err => {
    console.warn("there was an error");
    console.warn(err);
});


// theater_map.on('popupopen', (p) => {
//     var poly = render_route(p.popup.unit);
//     p.popup.route_polyline = poly;
//     poly.pm.enable({
//         allowSelfIntersection: true,
//     });

// });

// theater_map.on('popupclose', (p) => {
//     console.log(p.popup.route_polyline);

// });
