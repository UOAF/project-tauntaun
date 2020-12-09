import React, { ReactElement } from 'react';
import { DcsUnit, DcsUnitProps } from './DcsUnit';

const excludedUnits = ['big_smoke'];

export function DcsUnitFilter(props: DcsUnitProps): ReactElement | null {
  const { unit } = props;

  if (excludedUnits.includes(unit.type)) {
    return null;
  } else {
    return <DcsUnit {...props} />;
  }
}
