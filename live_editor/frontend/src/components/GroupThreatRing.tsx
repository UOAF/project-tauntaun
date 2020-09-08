import React from 'react';

import { DcsStaticData, Group } from '../models';
import { Circle } from 'react-leaflet';
import * as DcsStaticRawJson from '../data/dcs_static.json';
import { filter } from 'lodash';
import { Point } from '../models/dcs';

export type GroupThreatRingProps = {
  group: Group;
  showPerUnit?: boolean;
};

export function GroupThreatRing(props: GroupThreatRingProps) {
  const { group } = props;
  const showPerUnit = props.showPerUnit !== undefined ? props.showPerUnit : false;

  const units = group.units
    .map(unit => {
      const DcsStatic = (DcsStaticRawJson as any).default as DcsStaticData;
      const vehicleType = filter(DcsStatic.vehicles, vehicle => vehicle.id === unit.type).pop();
      const threatRange = vehicleType ? +vehicleType.threat_range : 0;

      return { ...unit, threat_range: threatRange };
    })
    .filter(unit => unit.threat_range > 0);

  const renderThreatCircle = (radius: number, position: Point) => {
    const { lat, lon: lng } = position;
    return (
      <Circle
        center={{ lat, lng }}
        radius={radius}
        stroke={true}
        color="red"
        fill={false}
        fillOpacity={0.01}
        opacity={0.25}
      />
    );
  };

  if (showPerUnit) {
    return <div>{units.map(unit => renderThreatCircle(unit.threat_range, unit.position))}</div>;
  } else {
    const maxRangeUnit = units.sort(a => a.threat_range).pop();
    if (maxRangeUnit) {
      return renderThreatCircle(maxRangeUnit.threat_range, maxRangeUnit.position);
    } else {
      return <div></div>;
    }
  }
}
