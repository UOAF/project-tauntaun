import React, { ReactElement } from 'react';

import { Unit, getStaticUnit, DcsStaticDataStateContainer } from '../../../../models';
import { CategoryContext } from '../contexts';
import { ThreatCircle } from '../markers/ThreatCircle';
import { CoalitionContext } from '..';

export type DcsUnitThreatRingProps = {
  unit: Unit;
};

export function DcsUnitThreatRing(props: DcsUnitThreatRingProps): ReactElement {
  const { unit } = props;
  const { dcsStaticData } = DcsStaticDataStateContainer.useContainer();

  const groupCategory = React.useContext(CategoryContext);

  const { sessionCoalition, groupCoalition } = React.useContext(CoalitionContext);
  const isSameCoalition = sessionCoalition === groupCoalition;

  const staticUnit = getStaticUnit(dcsStaticData, groupCategory, unit);
  const airWeaponRange = staticUnit ? +staticUnit.air_weapon_dist : 0;

  return (
    <ThreatCircle
      radius={airWeaponRange}
      position={unit.position}
      color={isSameCoalition ? 'blue' : 'red'}
      weight={3}
    />
  );
}
