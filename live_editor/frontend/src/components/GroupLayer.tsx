import React from 'react';

import { Group } from '../models';
import { GroupRoute, GroupMarker, ModeContext } from '.';
import { AppStateContainer } from '../models/appState';
import { SessionContext } from './App';
import { findGroupById } from '../models/dcs_util';
import { CoalitionContext } from './CoalitionLayer';

export type GroupLayerProps = {
  groups: Group[];
};

export function GroupLayer(props: GroupLayerProps) {
  const appState = AppStateContainer.useContainer();

  const { groups } = props;

  const { groupMarkerOnClick, selectedGroupId } = React.useContext(ModeContext);
  const { sessionId, sessions } = React.useContext(SessionContext);
  const coalition = React.useContext(CoalitionContext);

  const isLeadOfFlight = () => {
    if (sessionId === -1 || !selectedGroupId) return false;
    const sessionData = sessions[sessionId];
    const group = findGroupById(appState.mission, selectedGroupId);

    return group !== undefined && sessionData.selected_unit_id === group.units[0].id;
  };

  const isRouteEditable = selectedGroupId !== undefined && (appState.adminMode || isLeadOfFlight());

  const visibleGroups = groups.filter(g => coalition !== 'red' || g.name.substr(0, 4) === 'vis_');

  return (
    <div>
      {visibleGroups.map(group => (
        <GroupMarker key={'group' + group.id} group={group} groupMarkerOnClick={groupMarkerOnClick} />
      ))}
      {selectedGroupId &&
        visibleGroups
          .filter(group => group.id === selectedGroupId)
          .map(group => <GroupRoute key={'groupRoute' + group.id} group={group} editable={isRouteEditable} />)}
    </div>
  );
}
