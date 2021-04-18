import React from 'react';

import { Group, MapStateContainer } from '../../../models';
import { ModeContext } from '../../contexts';
import { CoalitionContext } from './CoalitionLayer';
import { DcsGroup } from './markers';

export type GroupLayerProps = {
  groups: Group[];
};
export function GroupLayer(props: GroupLayerProps) {
  const { showAllGroups, hideAllHostileUnits } = MapStateContainer.useContainer();

  const { groupOnClick } = React.useContext(ModeContext);
  const { sessionCoalition, groupCoalition } = React.useContext(CoalitionContext);

  const { groups } = props;

  const isSameCoalition = groupCoalition === sessionCoalition;

  const visibleGroups = groups.filter(
    g => isSameCoalition || (g.hidden === 'false' && g.hidden_on_planner === 'false' && !hideAllHostileUnits) || showAllGroups
  );

  const groupsAlive = visibleGroups.filter(g => g.dead === 'false');

  return (
    <React.Fragment>
      {groupsAlive.map(group => (
        <DcsGroup key={`dcs_group${group.id}`} group={group} groupOnClick={groupOnClick} />
      ))}
    </React.Fragment>
  );
}
