import './GroupRoute.css';
import React from 'react';
import { SelectionStateContainer, Group } from '../../../../models';
import { LatLng } from 'leaflet';
import { gameService } from '../../../../services';
import { EditablePolyline } from './EditablePolyline';
import { TextMarker } from '../markers';
import { ColorContext } from '../contexts';
import { CircleMarker } from 'react-leaflet';
import { DistanceMarkers } from './DistanceMarkers';

export type GroupRouteProps = {
  group: Group;
  editable: boolean;
  showWaypointNames?: boolean;
  isSelected?: boolean;
};

export function GroupRoute(props: GroupRouteProps) {
  const { selectWaypoint } = SelectionStateContainer.useContainer();
  const colors = React.useContext(ColorContext);

  const { isSelected: isSelectedProp, group, editable, showWaypointNames } = props;

  const isSelected = isSelectedProp ? isSelectedProp : false;
  const positions = group.points.map(point => new LatLng(point.position.lat, point.position.lon));
  const labels = group.points.map((point, i) => ({
    text: `[${i.toString()}] ${point.name}`,
    position: new LatLng(point.position.lat, point.position.lon)
  }));

  const handlePositionInserted = (index: number, pos: LatLng) => {
    const oldPoint = group.points[index];

    gameService.sendRouteInsertAt(group, oldPoint.position, {
      lat: pos.lat,
      lon: pos.lng
    });

    console.log(`Point inserted at [${index}]`);
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
    // TODO check for isleadofflight / commander -> ableToSelect -> extract to context
    selectWaypoint(index);

    console.log('Point clicked.', index);
  };

  const renderNonEditableWp = (position: LatLng, index: number) => (
    <CircleMarker
      interactive={false}
      key={`WpMarker_${index}`}
      center={position}
      radius={isSelected ? 7 : 4}
      fillOpacity={0}
      color={colors.color}
      weight={1}
    />
  );

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
        drawMarkers={editable}
        disableWpZero={true}
      />
      {!editable && positions.map((p, i) => renderNonEditableWp(p, i))}
      {isSelected && <DistanceMarkers positions={positions} />}
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
