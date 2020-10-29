import React, { useMemo } from 'react';

import { Group } from '../../../../models';
import { CategoryContext } from '../contexts';
import { unitsWithPropGreaterThanZero } from './common';
import { DcsUnitThreatRing } from './DcsUnitThreatRing';

export type DcsGroupThreatRingProps = {
  group: Group;
};

export function DcsGroupThreatRing(props: DcsGroupThreatRingProps) {
  const { group } = props;

  const groupCategory = React.useContext(CategoryContext);

  const unitsWithAirWeaponDistance = useMemo(
    () => unitsWithPropGreaterThanZero(group, groupCategory, 'air_weapon_dist'),
    [group.id] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const maxAirWeaponDistanceUnit = [...unitsWithAirWeaponDistance].sort((a, b) => a.range - b.range).pop();

  return (
    <React.Fragment>
      {maxAirWeaponDistanceUnit && <DcsUnitThreatRing unit={maxAirWeaponDistanceUnit.unit} />}
    </React.Fragment>
  );
}
