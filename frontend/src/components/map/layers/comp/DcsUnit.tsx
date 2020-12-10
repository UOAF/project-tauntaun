import React, { ReactElement } from 'react';

import { matchCategoryToStaticCategory, Unit, getStaticUnit, DcsStaticDataStateContainer } from '../../../../models';
import { UnitMarker } from '../markers/UnitMarker';
import { CategoryContext } from '../contexts';

export type DcsUnitProps = {
  unit: Unit;
  unitOnClick?: (unit: Unit) => void;
};

export function DcsUnit(props: DcsUnitProps): ReactElement {
  const { unit, unitOnClick } = props;
  const { dcsStaticData } = DcsStaticDataStateContainer.useContainer();
  const groupCategory = React.useContext(CategoryContext);

  const staticUnit = getStaticUnit(dcsStaticData, groupCategory, unit);

  const onClick = (unit: Unit) => unitOnClick?.(unit);

  const getUnitLabel = (unit: Unit) => {
    const staticCategory = matchCategoryToStaticCategory(groupCategory);

    if (staticCategory === 'vehicles') return staticUnit ? staticUnit.name : unit.type;
    return unit.type;
  };

  return <UnitMarker label={getUnitLabel(unit)} unit={unit} unitMarkerOnClick={onClick} />;
}
