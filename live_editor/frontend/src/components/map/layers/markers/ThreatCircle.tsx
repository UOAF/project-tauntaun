import React, { useMemo } from 'react';

import { Circle } from 'react-leaflet';
import { Point } from '../../../../models/dcs';

export type ThreatCircleProps = {
  radius: number;
  position: Point;
};

export function ThreatCircleNonMemo(props: ThreatCircleProps) {
  const { radius, position } = props;

  return (
    <Circle
      center={{ lat: position.lat, lng: position.lon }}
      radius={radius}
      stroke={true}
      color="red"
      fill={false}
      fillOpacity={0.01}
      opacity={0.25}
    />
  );
}
export function ThreatCircle(props: ThreatCircleProps) {
  const { radius, position } = props;

  const memorizedItem = useMemo(() => <ThreatCircleNonMemo {...props} />, [radius, position.lat, position.lon]); // eslint-disable-line react-hooks/exhaustive-deps

  return memorizedItem;
}
