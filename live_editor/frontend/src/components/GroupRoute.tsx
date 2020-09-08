import React from 'react';

import { EditablePolyline } from '.';
import { Group, AppStateContainer } from '../models';
import { LatLng } from 'leaflet';
import { gameService } from '../services';
import { MapText } from './MapText';
import { ColorContext } from './GroupLayer';

export type GroupRouteProps = {
  group: Group;
  editable: boolean;
  showWaypointNames?: boolean;
};

export function GroupRoute(props: GroupRouteProps) {
  const appState = AppStateContainer.useContainer();

  const { group, editable, showWaypointNames } = props;
  const colors = React.useContext(ColorContext);

  const positions = group.points.map(point => new LatLng(point.position.lat, point.position.lon));
  const labels = group.points.map((point, i) => {
    return { text: `[${i.toString()}] ${point.name}`, position: new LatLng(point.position.lat, point.position.lon) };
  });

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

    console.log('Point removed.');
  };

  const handlePositionClicked = (index: number) => {
    if (appState.masterMode && appState.masterMode.name === 'EditGroupMode') {
      appState.selectWaypoint(index);
    }

    console.log('Point clicked.', index);
  };

  return (
    <div>
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
      />
      {showWaypointNames && labels.map(v => <MapText text={v.text} position={v.position} />)}
    </div>
  );
}
