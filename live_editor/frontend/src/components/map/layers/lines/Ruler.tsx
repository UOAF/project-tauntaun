import { LatLng } from 'leaflet';
import React, { useState } from 'react';
import { useMap } from 'react-leaflet';
import { DistanceMarkers } from './DistanceMarkers';
import { EditablePolyline } from './EditablePolyline';

export function Ruler() {
  const map = useMap();
  const mapCenter = map.getCenter();
  const mapBoundEast = map.getBounds().getEast();
  const mapBoundWest = map.getBounds().getWest();
  const quarter = Math.abs(mapBoundWest - mapBoundEast) / 4.0;
  const [positions, setPositions] = useState([
    new LatLng(mapCenter.lat, mapCenter.lng - quarter),
    new LatLng(mapCenter.lat, mapCenter.lng + quarter)
  ]);

  const handlePositionModified = (index: number, pos: LatLng) => {
    const newPositions = [...positions];
    newPositions[index] = pos;
    setPositions(newPositions);
  };

  return (
    <React.Fragment>
      <EditablePolyline
        positions={positions}
        color="black"
        stroke={true}
        weight={3}
        opacity={1}
        dashArray="1"
        drawMidmarkers={false}
        onPositionModified={handlePositionModified}
      />
      <DistanceMarkers positions={positions} showBearing={true} />
    </React.Fragment>
  );
}
