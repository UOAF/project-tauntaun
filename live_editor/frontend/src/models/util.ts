import { LatLng } from 'leaflet';
import L from 'leaflet';
import tokml from 'tokml';

export type Dictionary<T> = {
  [idx: string]: T;
  [idx: number]: T;
};

export function saveKmlFile(filename: string, data: string) {
  const blob = new Blob([data], { type: 'text/kml' });
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blob, filename);
  } else {
    const elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = filename;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
  }
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
