import React, { createContext } from 'react';

import { Group } from '../models';
import { GroupRoute, GroupMarker, ModeContext } from '.';
import { AppStateContainer } from '../models/appState';
import { SessionContext, ColorPaletteContext, LegendContext } from './App';
import { findGroupById } from '../models/dcs_util';
import { CoalitionContext } from './CoalitionLayer';

export type GroupLayerProps = {
  groups: Group[];
};

export type ColorContextType = {
  color: string;
  opacity: number;
  dashArray?: string;
};

export const ColorContext = createContext({} as ColorContextType);

export function GroupLayer(props: GroupLayerProps) {
  const appState = AppStateContainer.useContainer();

  const { groups } = props;

  const { groupMarkerOnClick, selectedGroupId } = React.useContext(ModeContext);
  const { sessionId, sessions } = React.useContext(SessionContext);
  const coalition = React.useContext(CoalitionContext);
  const colorPalette = React.useContext(ColorPaletteContext);
  const legendContext = React.useContext(LegendContext);

  const isLeadOfFlight = () => {
    if (sessionId === -1 || !selectedGroupId) return false;
    const sessionData = sessions[sessionId];
    const group = findGroupById(appState.mission, selectedGroupId);

    return group !== undefined && sessionData.selected_unit_id === group.units[0].id;
  };

  const visibleGroups = groups.filter(
    g => coalition !== 'red' || g.name.substr(0, 4) === 'vis_' || appState.showAllGroups
  );

  const renderGroupRoute = (group: Group) => {
    const color = colorPalette[group.id % colorPalette.length];
    const isSelected = group.id === selectedGroupId;
    const isRouteEditable = selectedGroupId !== undefined && (appState.adminMode || (isLeadOfFlight() && isSelected));

    legendContext.legends.push({ color: color, text: group.name });

    return (
      <ColorContext.Provider
        value={{
          color: color,
          opacity: isSelected ? 1.0 : 0.3,
          dashArray: isSelected ? '1' : '5 2 1'
        }}
      >
        <GroupRoute
          key={'groupRoute' + group.id}
          group={group}
          editable={isRouteEditable}
          showWaypointNames={isSelected || appState.showOtherWpNames}
        />
      </ColorContext.Provider>
    );
  };

  return (
    <div>
      {visibleGroups.map(group => (
        <GroupMarker key={'group' + group.id} group={group} groupMarkerOnClick={groupMarkerOnClick} />
      ))}
      {visibleGroups
        .filter(g => {
          const itSelectedOrShowOther = g.id === selectedGroupId || appState.showOtherFlightPlans;
          const itClientOrShowAI = g.units[0].skill === 'Skill.Client' || appState.showAIFlightPlans;
          const isBlue = coalition === 'blue';
          return isBlue && itSelectedOrShowOther && itClientOrShowAI;
        })
        .map(group => renderGroupRoute(group))}
    </div>
  );
}
