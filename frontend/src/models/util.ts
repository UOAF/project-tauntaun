import { LatLng } from 'leaflet';
import L from 'leaflet';
import tokml from 'tokml';
import { NIL } from 'uuid';

export type Dictionary<T> = {
  [idx: string]: T;
  [idx: number]: T;
};

export function saveKmlFile(filename: string, data: string) {
  const blob = new Blob([data], { type: 'text/kml' });
  // The following will break on IE. I don't care.
  const elem = window.document.createElement('a');
  elem.href = window.URL.createObjectURL(blob);
  elem.download = filename;
  document.body.appendChild(elem);
  elem.click();
  document.body.removeChild(elem);
}

export function openInNewTab(url: string) {
  window.open(url, '_blank');
}

export function getGoogleEarthUrl(latlng: LatLng) {
  return `https://earth.google.com/web/@${latlng.lat},${latlng.lng},40a,5000d,35y,15h,60t,0r`;
}

export function convertLeafletMapToKml(map: any) {
  const collection = {
    type: 'FeatureCollection',
    features: [] as any[]
  };

  map.eachLayer(function (layer: any) {
    if (layer instanceof L.Marker || layer instanceof L.Polyline) {
      const geoJSON = layer.toGeoJSON();
      const options = layer.options as any;

      const name = options.label ? options.label : options.icon ? (options.icon.label ? options.icon.label : '') : '';
      const color = options.color ? options.color : '';

      collection.features.push({
        ...geoJSON,
        properties: {
          ...geoJSON.properties,
          name: name,
          color: color
        }
      });
    }
  });

  return tokml(collection);
}

// Copied from https://github.com/gokertanrisever/leaflet-ruler
export function calculateBearing(from: LatLng, to: LatLng) {
  const f1 = from.lat;
  const l1 = from.lng;
  const f2 = to.lat;
  const l2 = to.lng;
  const toRadian = Math.PI / 180.0;

  // haversine formula
  const y = Math.sin((l2 - l1) * toRadian) * Math.cos(f2 * toRadian);
  const x =
    Math.cos(f1 * toRadian) * Math.sin(f2 * toRadian) -
    Math.sin(f1 * toRadian) * Math.cos(f2 * toRadian) * Math.cos((l2 - l1) * toRadian);
  let bearing = Math.atan2(y, x) * (180.0 / Math.PI);
  bearing += bearing < 0 ? 360.0 : 0.0;

  return bearing;
}
