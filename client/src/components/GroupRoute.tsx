import React from 'react';

import { EditablePolyline } from '.';
import { Group } from '../models';


export type GroupRouteProps = {
  group: Group;
};

export function GroupRoute(props: GroupRouteProps) {  
  const { group } = props;
  const positions = group.points.map(point => ({ lat: point.position.lat, lng: point.position.lon }));

  
  return <EditablePolyline group={group} positions={positions} color="#2d4687" stroke={true} />;
}
