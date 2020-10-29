import React, { ReactElement } from 'react';

import { matchCategoryToStaticCategory, Unit, getStaticUnit } from '../../../../models';
import { UnitMarker } from '../markers/UnitMarker';
import { CategoryContext } from '../contexts';

export type DcsUnitProps = {
  unit: Unit;
  unitOnClick?: (unit: Unit) => void;
};

export function DcsUnit(props: DcsUnitProps): ReactElement {
  const { unit, unitOnClick } = props;
  const groupCategory = React.useContext(CategoryContext);

  const staticUnit = getStaticUnit(groupCategory, unit);

  const onClick = (unit: Unit) => unitOnClick?.(unit);

  const getUnitLabel = (unit: Unit) => {
    const staticCategory = matchCategoryToStaticCategory(groupCategory);

    if (staticCategory === 'vehicles') return staticUnit ? staticUnit.name : unit.type;
    return unit.type;
  };

  return <UnitMarker label={getUnitLabel(unit)} unit={unit} unitMarkerOnClick={onClick} />;
}
