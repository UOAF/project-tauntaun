import React from 'react';
import { LatLng } from 'leaflet';
import { TextMarker } from '../markers';
import { c_MeterToNm } from '../../../../data/constants';

export type DistanceMarkersProps = {
  positions: LatLng[];
};

export function DistanceMarkers(props: DistanceMarkersProps) {
  const { positions } = props;

  const midPoint = (a: LatLng, b: LatLng) => {
    const lat = a.lat + (b.lat - a.lat) * 0.5;
    const lng = a.lng + (b.lng - a.lng) * 0.5;
    return new LatLng(lat, lng);
  };

  const distances = positions.reduce(
    (p, c, i, array) => (i < array.length - 1 ? [...p, c.distanceTo(array[i + 1]) * c_MeterToNm] : [...p]),
    [] as number[]
  );
  const distanceTextPositions = positions.reduce(
    (p, c, i, array) => (i < array.length - 1 ? [...p, midPoint(c, array[i + 1])] : [...p]),
    [] as LatLng[]
  );

  return (
    <React.Fragment>
      {distanceTextPositions.map((p, i) => (
        <TextMarker
          key={`distance_text${i}`}
          text={distances[i].toFixed(1)}
          position={p}
          color={'white'}
          backgroundColor={'black'}
          size={11}
        />
      ))}
    </React.Fragment>
  );
}
