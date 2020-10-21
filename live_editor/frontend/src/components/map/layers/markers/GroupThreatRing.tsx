import React, { useMemo } from 'react';

import { AppStateContainer, getThreatRangeForUnit, Group, Unit } from '../../../../models';
import { ThreatCircle } from './ThreatCircle';
import { CategoryContext } from '../contexts';
import { CoalitionContext } from '..';

export type GroupThreatRingProps = {
  group: Group;
  showPerUnit?: boolean;
};

export function GroupThreatRing(props: GroupThreatRingProps) {
  const { coalition } = AppStateContainer.useContainer();
  const { showPerUnit: showPerUnitProp, group } = props;

  const showPerUnit = showPerUnitProp ? showPerUnitProp : false;
  const groupCategory = React.useContext(CategoryContext);
  const groupCoalition = React.useContext(CoalitionContext);
  const isSameCoalition = groupCoalition === coalition;
  const color = isSameCoalition ? 'blue' : 'red';

  type UnitWithRange = {
    range: number;
    unit: Unit;
  };
  const unitsWithRange = useMemo(
    () =>
      group.units
        .map(unit => ({ range: getThreatRangeForUnit(groupCategory, unit), unit: unit } as UnitWithRange))
        .filter(kv => kv.range > 0),
    [group.id] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const renderForAllUnits = () => (
    <React.Fragment>
      {unitsWithRange.map((unitWithRange, index) => (
        <ThreatCircle
          key={`threat_circle_${unitWithRange.unit.id}_${index}`}
          radius={unitWithRange.range}
          position={unitWithRange.unit.position}
          color={color}
        />
      ))}
    </React.Fragment>
  );

  const renderForMaxRangeUnit = () => {
    const maxRangeUnit = [...unitsWithRange].sort((a, b) => a.range - b.range).pop();
    return (
      <React.Fragment>
        {maxRangeUnit && (
          <ThreatCircle radius={maxRangeUnit.range} position={maxRangeUnit.unit.position} color={color} />
        )}
      </React.Fragment>
    );
  };

  return showPerUnit ? renderForAllUnits() : renderForMaxRangeUnit();
}
