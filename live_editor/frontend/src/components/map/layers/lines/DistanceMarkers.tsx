import React from 'react';
import { LatLng } from 'leaflet';
import { TextMarker } from '../markers';
import { c_MeterToNm } from '../../../../data/constants';
import { calculateBearing } from '../../../../models/util';

export type DistanceMarkersProps = {
  positions: LatLng[];
  showBearing?: boolean;
  showDistance?: boolean;
};

export function DistanceMarkers(props: DistanceMarkersProps) {
  const { positions, showBearing: showBearingProp, showDistance: showDistanceProp } = props;

  const showBearing = showBearingProp ? showBearingProp : false;
  const showDistance = showDistanceProp ? showDistanceProp : true;

  const midPoint = (a: LatLng, b: LatLng) => {
    const lat = a.lat + (b.lat - a.lat) * 0.5;
    const lng = a.lng + (b.lng - a.lng) * 0.5;
    return new LatLng(lat, lng);
  };

  const distances = positions.reduce(
    (p, c, i, array) => (i < array.length - 1 ? [...p, c.distanceTo(array[i + 1]) * c_MeterToNm] : [...p]),
    [] as number[]
  );

  const bearings = positions.reduce(
    (p, c, i, array) => (i < array.length - 1 ? [...p, calculateBearing(c, array[i + 1])] : [...p]),
    [] as number[]
  );

  const distanceTextPositions = positions.reduce(
    (p, c, i, array) => (i < array.length - 1 ? [...p, midPoint(array[i + 1], c)] : [...p]),
    [] as LatLng[]
  );

  return (
    <React.Fragment>
      {distanceTextPositions.map((p, i) => {
        const bearing = showBearing ? bearings[i].toFixed(0) + '\xb0 ' : '';
        const distance = showDistance ? distances[i].toFixed(1) : '';
        const text = `${bearing}${distance}`;
        return (
          <TextMarker
            key={`distance_text${i}`}
            text={text}
            position={p}
            color={'white'}
            backgroundColor={'black'}
            size={11}
          />
        );
      })}
    </React.Fragment>
  );
}
