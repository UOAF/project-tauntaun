import React, { useMemo } from 'react';

import { DcsStaticData, Group } from '../../../../models';
import * as DcsStaticRawJson from '../../../../data/dcs_static.json';
import { filter } from 'lodash';
import { ThreatCircle } from './ThreatCircle';

export type GroupThreatRingProps = {
  group: Group;
  showPerUnit?: boolean;
};

export function GroupThreatRing(props: GroupThreatRingProps) {
  const DcsStatic = (DcsStaticRawJson as any).default as DcsStaticData;
  const { showPerUnit: showPerUnitProp, group } = props;

  const showPerUnit = showPerUnitProp ? showPerUnitProp : false;

  const units = useMemo(
    () =>
      group.units
        .map(unit => {
          const vehicleType = filter(DcsStatic.vehicles, vehicle => vehicle.id === unit.type).pop();
          const threatRange = vehicleType ? +vehicleType.threat_range : 0;

          return { ...unit, threat_range: threatRange };
        })
        .filter(unit => unit.threat_range > 0),
    [group.id] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const renderForAllUnits = () => (
    <React.Fragment>
      {units.map((unit, index) => (
        <ThreatCircle key={`threat_circle_${unit.id}_${index}`} radius={unit.threat_range} position={unit.position} />
      ))}
    </React.Fragment>
  );

  const renderForMaxRangeUnit = () => {
    const maxRangeUnit = [...units].sort((a, b) => a.threat_range - b.threat_range).pop();
    return (
      <React.Fragment>
        {maxRangeUnit && <ThreatCircle radius={maxRangeUnit.threat_range} position={maxRangeUnit.position} />}
      </React.Fragment>
    );
  };

  return showPerUnit ? renderForAllUnits() : renderForMaxRangeUnit();
}
