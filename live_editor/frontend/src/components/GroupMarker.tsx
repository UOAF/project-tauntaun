import React from 'react';

import { Group, Unit, AppStateContainer } from '../models';
import { CoalitionContext } from './CoalitionLayer';
import { UnitMarker } from '.';
import { GroupThreatRing } from './GroupThreatRing';

export type GroupProps = {
  group: Group;
  groupMarkerOnClick?: (group: Group, event: any) => void;
};

export function GroupMarker(props: GroupProps) {
  const appState = AppStateContainer.useContainer();

  const { showUnits, showThreatRings } = appState;
  const { group, groupMarkerOnClick } = props;

  const coalition = React.useContext(CoalitionContext);

  const onClick = (unit: Unit) => {
    if (groupMarkerOnClick) {
      groupMarkerOnClick(group, { coalition: coalition });
    }
  };

  const renderThreatRings = (showPerUnit: boolean) => {
    if (showThreatRings) {
      return <GroupThreatRing group={group} showPerUnit={showPerUnit} />;
    }
  };

  if (showUnits) {
    return (
      <div>
        {group.units.map(unit => (
          <UnitMarker key={unit.name} unit={unit} unitMarkerOnClick={onClick} />
        ))}
        {coalition === 'red' && renderThreatRings(true)}
      </div>
    );
  } else {
    return (
      <div>
        <UnitMarker unit={group.units[0]} label={group.name} unitMarkerOnClick={onClick} />;
        {coalition === 'red' && renderThreatRings(true)}
      </div>
    );
  }
}
