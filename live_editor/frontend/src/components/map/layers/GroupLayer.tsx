import React from 'react';

import { Group, MapStateContainer } from '../../../models';
import { AppStateContainer } from '../../../models';
import { ModeContext } from '../../contexts';
import { CoalitionContext } from './CoalitionLayer';
import { DcsGroup } from './markers';

export type GroupLayerProps = {
  groups: Group[];
};
export function GroupLayer(props: GroupLayerProps) {
  const { coalition } = AppStateContainer.useContainer();
  const { showAllGroups, hideAllHostileUnits } = MapStateContainer.useContainer();

  const { groupOnClick } = React.useContext(ModeContext);
  const groupCoalition = React.useContext(CoalitionContext);

  const { groups } = props;

  const isSameCoalition = groupCoalition === coalition;
  const visibleGroups = groups.filter(
    g => isSameCoalition || (g.hidden === 'false' && !hideAllHostileUnits) || showAllGroups
  );

  return (
    <React.Fragment>
      {visibleGroups.map(group => (
        <DcsGroup key={`dcs_group${group.id}`} group={group} groupOnClick={groupOnClick} />
      ))}
    </React.Fragment>
  );
}
