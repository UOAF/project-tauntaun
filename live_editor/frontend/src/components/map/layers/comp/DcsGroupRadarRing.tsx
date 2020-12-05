import React, { useMemo } from 'react';

import { DcsStaticDataStateContainer, Group } from '../../../../models';
import { CategoryContext } from '../contexts';
import { unitsWithPropGreaterThanZero } from './common';
import { DcsUnitRadarRing } from './DcsUnitRadarRing';

export type DcsGroupRadarRingProps = {
  group: Group;
};

export function DcsGroupRadarRing(props: DcsGroupRadarRingProps) {
  const { group } = props;

  const { dcsStaticData } = DcsStaticDataStateContainer.useContainer();

  const groupCategory = React.useContext(CategoryContext);

  const unitsWithDetectionRange = useMemo(
    () => unitsWithPropGreaterThanZero(dcsStaticData, group, groupCategory, 'detection_range'),
    [group.id]
  );

  const maxDetectionRangeUnit = [...unitsWithDetectionRange].sort((a, b) => a.range - b.range).pop();

  return (
    <React.Fragment>{maxDetectionRangeUnit && <DcsUnitRadarRing unit={maxDetectionRangeUnit.unit} />}</React.Fragment>
  );
}
