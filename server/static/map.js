
var x0 = 43;
var y0 = 41;

var theater_map = L.map('mapid').setView([x0, y0], 9);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}@2x.png?access_token=pk.eyJ1IjoiYm9ibW9yZXR0aSIsImEiOiJjazI4amV6eWswaWF2M2JtYjh3dmowdnQ1In0.XutSpPpaRm9LZudTNgVZwQ', {
    maxZoom: 13,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'bobmoretti.3zp0vycr'
}).addTo(theater_map);

function is_underway(unit)
{
    return unit.points[0].action == "Turning Point";
}

function render_route(unit)
{
    var latlons = unit.points.map((p) => [p.lat, p.lon]);
    var polyline = L.polyline(latlons, {color: '#2d4687', stroke: 1});
    polyline.addTo(theater_map);
    return polyline;
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
    m.bindPopup(p).openPopup();
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


// fetch('game/plane_groups/blue').then(response => {
//     return response.json();
// }).then(blue_plane_data => {
//     console.log(blue_plane_data);
//     return render_plane_groups(blue_plane_data);
// }).catch(err => {
//     console.warn("there was an error");
//     console.warn(err);
// });

// fetch('game/ships/blue').then(response => {

// }).then


// L.marker([x0, y0]).addTo(theater_map)
//     .bindPopup("<b>Hello world!</b><br />I am a popup.").openPopup();

// L.circle([51.508, -0.11], 500, {
//     color: 'red',
//     fillColor: '#f03',
//     fillOpacity: 0.5
// }).addTo(theater_map).bindPopup("I am a circle.");

// L.polygon([
//     [51.509, -0.08],
//     [51.503, -0.06],
//     [51.51, -0.047]
// ]).addTo(theater_map).bindPopup("I am a polygon.");


// var popup = L.popup();

// function onMapClick(e) {
//     popup
//         .setLatLng(e.latlng)
//         .setContent("You clicked the map at " + e.latlng.toString())
//         .openOn(theater_map);
// }

// theater_map.on('click', onMapClick);
theater_map.on('popupopen', (p) => {
    p.popup.route_polyline = render_route(p.popup.unit);
});

theater_map.on('popupclose', (p) => {
    console.log(p.popup.route_polyline);
    p.popup.route_polyline.removeFrom(theater_map);
    p.popup.route_polyline = null;
});
