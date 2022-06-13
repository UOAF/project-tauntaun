import { LatLng, Map, Layer } from 'leaflet';
import L from 'leaflet';
import tokml from 'tokml';
import { Feature, Geometry, GeoJsonProperties, FeatureCollection } from 'geojson';

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

export function convertLeafletMapToKml(map: Map) {
  const collection = {} as FeatureCollection;

  const getMarkerName = (marker: L.Marker) : string => {
    const opts = marker.options as L.MarkerOptions;
    if (opts.title) {
      return opts.title;
    }

    if (opts.icon && opts.icon.options.className) {
      return opts.icon.options.className;
    }

    if (opts.alt) {
      return opts.alt;
    }
    return '';
  }

  const getLineColor = (layer: L.Polyline) => {
    const opts = layer.options;
    const color = opts.color ? opts.color : '#000000';
    return color;
  };

  const makeFeature = (layer: L.Marker | L.Polyline, color: string) => {
    const geoJSON = layer.toGeoJSON();
    const feature = {
      ...geoJSON,
      properties: {
        ...geoJSON.properties,
        color: color
      }
    } as Feature<Geometry, GeoJsonProperties>;

    return feature;
  };

  map.eachLayer(function (layer: Layer) {
    if (layer instanceof L.Marker) {
      const name = getMarkerName(layer);
      const feature = makeFeature(layer, '#000000');
      const props = feature.properties;
      if (props) {
        props.name = name;
      }
      collection.features.push(feature);
    }
    else if (layer instanceof L.Polyline) {
      const color = getLineColor(layer);
      const feature = makeFeature(layer, color);
      collection.features.push(feature);
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
