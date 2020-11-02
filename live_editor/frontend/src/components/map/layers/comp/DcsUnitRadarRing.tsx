import React, { ReactElement } from 'react';

import { Unit, getStaticUnit, AppStateContainer } from '../../../../models';
import { CategoryContext } from '../contexts';
import { ThreatCircle } from '../markers/ThreatCircle';
import { CoalitionContext } from '..';

export type DcsUnitRadarRingProps = {
  unit: Unit;
};

export function DcsUnitRadarRing(props: DcsUnitRadarRingProps): ReactElement {
  const { coalition } = AppStateContainer.useContainer();
  const { unit } = props;
  const groupCategory = React.useContext(CategoryContext);

  const groupCoalition = React.useContext(CoalitionContext);
  const isSameCoalition = coalition === groupCoalition;

  const staticUnit = getStaticUnit(groupCategory, unit);
  const detectionRange = staticUnit ? +staticUnit.detection_range : 0;

  return (
    <ThreatCircle
      radius={detectionRange}
      position={unit.position}
      color={isSameCoalition ? 'cyan' : 'orange'}
      weight={2}
    />
  );
}
