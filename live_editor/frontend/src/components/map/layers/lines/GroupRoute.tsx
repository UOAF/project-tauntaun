import './GroupRoute.css';
import React from 'react';
import { AppStateContainer, Group } from '../../../../models';
import { LatLng } from 'leaflet';
import { gameService } from '../../../../services';
import { EditablePolyline } from './EditablePolyline';
import { TextMarker } from '../markers';
import { ColorContext } from '../contexts';
import { c_MeterToNm } from '../../../../data/constants';

export type GroupRouteProps = {
  group: Group;
  editable: boolean;
  showWaypointNames?: boolean;
  isSelected?: boolean;
};

export function GroupRoute(props: GroupRouteProps) {
  const { selection } = AppStateContainer.useContainer();
  const { selectWaypoint } = selection;
  const colors = React.useContext(ColorContext);

  const { isSelected: isSelectedProp, group, editable, showWaypointNames } = props;

  const isSelected = isSelectedProp ? isSelectedProp : false;
  const positions = group.points.map(point => new LatLng(point.position.lat, point.position.lon));
  const labels = group.points.map((point, i) => ({
    text: `[${i.toString()}] ${point.name}`,
    position: new LatLng(point.position.lat, point.position.lon)
  }));

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

  const handlePositionInserted = (index: number, pos: LatLng) => {
    const oldPoint = group.points[index];

    gameService.sendRouteInsertAt(group, oldPoint.position, {
      lat: pos.lat,
      lon: pos.lng
    });

    console.log('Point inserted.');
  };

  const handlePositionModified = (index: number, pos: LatLng) => {
    const oldPoint = group.points[index];

    gameService.sendRouteModify(group, oldPoint.position, {
      ...oldPoint,
      position: {
        lat: pos.lat,
        lon: pos.lng
      }
    });

    console.log('Point modified.');
  };

  const handlePositionRemoved = (index: number) => {
    const oldPoint = group.points[index];

    gameService.sendRouteRemove(group, oldPoint.position);

    console.log(`Point removed ${index}`);
  };

  const handlePositionClicked = (index: number) => {
    selectWaypoint(index);

    console.log('Point clicked.', index);
  };

  // TODO order
  return (
    <React.Fragment>
      <EditablePolyline
        positions={positions}
        color={colors.color}
        stroke={true}
        weight={2}
        opacity={colors.opacity}
        dashArray={colors.dashArray}
        onPositionInserted={handlePositionInserted}
        onPositionModified={handlePositionModified}
        onPositionRemoved={handlePositionRemoved}
        onPositionClicked={handlePositionClicked}
        editable={editable}
        nonEditableWpRadius={isSelected ? 7 : 4}
      />
      {isSelected &&
        distanceTextPositions.map((p, i) => (
          <TextMarker
            key={`distance_text${i}`}
            text={distances[i].toFixed(1)}
            position={p}
            color={'white'}
            backgroundColor={'black'}
            size={11}
          />
        ))}
      {showWaypointNames &&
        labels.map((v, i) => (
          <TextMarker
            key={`maptext${i}`}
            text={v.text}
            position={v.position}
            color={colors.color}
            backgroundColor={'white'}
          />
        ))}
    </React.Fragment>
  );
}
