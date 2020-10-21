import React, { ReactElement } from 'react';
import { CoalitionContext } from '..';

import { Group, AppStateContainer, matchCategoryToStaticCategory, Unit, DcsStaticData } from '../../../../models';
import { GroupThreatRing } from './GroupThreatRing';
import { UnitMarker } from './UnitMarker';
import * as DcsStaticRawJson from '../../../../data/dcs_static.json';
import { CategoryContext } from '../contexts';
import { filter } from 'lodash';

export type GroupProps = {
  group: Group;
  groupOnClick?: (group: Group, event: any) => void;
};

export function DcsGroup(props: GroupProps): ReactElement {
  const DcsStatic = (DcsStaticRawJson as any).default as DcsStaticData;
  const { coalition, map } = AppStateContainer.useContainer();
  const {
    showUnits,
    showThreatRings: showThreatRingsConfig,
    showFriendlyThreatRings: showFriendlyThreatRingsConfig
  } = map;

  const groupCoalition = React.useContext(CoalitionContext);
  const groupCategory = React.useContext(CategoryContext);
  const isSameCoalition = coalition === groupCoalition;
  const showThreatRings = (showThreatRingsConfig && !isSameCoalition) || (showFriendlyThreatRingsConfig && isSameCoalition);

  const { group, groupOnClick } = props;

  const onClick = () => groupOnClick?.(group, { coalition: coalition });

  const getUnitLabel = (unit: Unit) => {
    const staticCategory = matchCategoryToStaticCategory(groupCategory);

    if (staticCategory === 'vehicles') {
      const staticUnit = filter(DcsStatic.vehicles, vehicle => vehicle.id === unit.type).pop();
      return staticUnit ? staticUnit.name : unit.type;
    }

    return unit.type;
  };

  const renderAllUnits = () => (
    <React.Fragment>
      {group.units.map((unit, index) => (
        <UnitMarker
          key={`unit_marker_${unit.id}_${index}`}
          label={getUnitLabel(unit)}
          unit={unit}
          unitMarkerOnClick={onClick}
        />
      ))}
      {showThreatRings && <GroupThreatRing group={group} showPerUnit={true} />}
    </React.Fragment>
  );

  const renderFirstUnit = () => (
    <React.Fragment>
      <UnitMarker unit={group.units[0]} label={getUnitLabel(group.units[0])} unitMarkerOnClick={onClick} />
      {showThreatRings && <GroupThreatRing group={group} showPerUnit={false} />}
    </React.Fragment>
  );

  return showUnits ? renderAllUnits() : renderFirstUnit();
}
