import React from 'react';

import { Group, Skill } from '../../../models';
import { AppStateContainer } from '../../../models';
import { findGroupById } from '../../../models/dcs_util';
import { isLeadOfFlight } from '../../common';
import { ModeContext } from '../../contexts';
import { ColorPaletteContext, LegendContext } from '../contexts';
import { CoalitionContext } from './CoalitionLayer';
import { ColorContext } from './contexts';
import { GroupRoute } from './lines';
import { DcsGroup } from './markers';

export type GroupLayerProps = {
  groups: Group[];
};
export function GroupLayer(props: GroupLayerProps) {
  const { commanderMode, coalition, map, mission: missionState } = AppStateContainer.useContainer();
  const { mission } = missionState;
  const { showAllGroups, showOtherWpNames, showOtherFlightPlans, showAIFlightPlans, hideAllHostileUnits } = map;

  const { selectedGroupId, selectedUnitId, groupOnClick } = React.useContext(ModeContext);
  const groupCoalition = React.useContext(CoalitionContext);
  const colorPalette = React.useContext(ColorPaletteContext);
  const legendContext = React.useContext(LegendContext);

  const { groups } = props;

  const group = selectedGroupId ? findGroupById(mission, selectedGroupId) : undefined;
  const isSelectedUnitLeadOfFlight = isLeadOfFlight(selectedUnitId, group);

  const isSameCoalition = groupCoalition === coalition;
  const visibleGroups = groups.filter(
    g => isSameCoalition || (g.hidden === 'false' && !hideAllHostileUnits) || showAllGroups
  );

  const visibleGroupsWithRoutes = visibleGroups.filter(g => {
    const isSelectedOrShowOther = g.id === selectedGroupId || showOtherFlightPlans;
    const isClientOrShowAI = g.units[0].skill === Skill.Client || showAIFlightPlans;
    const isSameCoalition = groupCoalition === coalition;
    return isSameCoalition && isSelectedOrShowOther && isClientOrShowAI;
  });

  const renderGroupRoute = (group: Group) => {
    const color = colorPalette[group.id % colorPalette.length];
    const isSelected = group.id === selectedGroupId;
    const isRouteEditable = selectedGroupId !== undefined && (commanderMode || (isSelectedUnitLeadOfFlight && isSelected));

    legendContext.legends.push({ color: color, text: group.name, bold: isSelected });

    return (
      <ColorContext.Provider
        key={`group_route:color_context${group.id}`}
        value={{
          color: color,
          opacity: isSelected ? 1.0 : 0.3,
          dashArray: isSelected ? '1' : '5 2 1'
        }}
      >
        <GroupRoute
          key={'group_route' + group.id}
          group={group}
          editable={isRouteEditable}
          showWaypointNames={isSelected || showOtherWpNames}
          isSelected={isSelected}
        />
      </ColorContext.Provider>
    );
  };

  return (
    <React.Fragment>
      {visibleGroups.map(group => (
        <DcsGroup key={`dcs_group${group.id}`} group={group} groupOnClick={groupOnClick} />
      ))}
      {visibleGroupsWithRoutes.map(group => renderGroupRoute(group))}
    </React.Fragment>
  );
}
