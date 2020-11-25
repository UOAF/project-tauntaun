import React, { ReactElement } from 'react';
import { CoalitionContext } from '..';

import { Group, AppStateContainer, MapStateContainer, isSkillAI } from '../../../../models';
import { ColorContext } from '../contexts';
import { ColorPaletteContext, LegendContext } from '../../contexts';
import { isLeadOfFlight } from '../../../common';
import { ModeContext } from '../../../contexts';
import { GroupRoute } from '../lines/GroupRoute';
import { DcsUnit } from './DcsUnit';
import { DcsUnitThreatRing } from './DcsUnitThreatRing';
import { DcsUnitRadarRing } from './DcsUnitRadarRing';
import { DcsGroupThreatRing } from './DcsGroupThreatRing';
import { DcsGroupRadarRing } from './DcsGroupRadarRing';

export type DcsGroupProps = {
  group: Group;
  groupOnClick?: (group: Group, event: any) => void;
};

export function DcsGroup(props: DcsGroupProps): ReactElement {
  const { commanderMode } = AppStateContainer.useContainer();
  const {
    showOtherFlightPlans,
    showAIFlightPlans,
    showOtherWpNames,
    showUnits,
    showThreatRings: showThreatRingsConfig,
    showFriendlyThreatRings: showFriendlyThreatRingsConfig,
    showRadarRings: showRadarRingsConfig,
    showFriendlyRadarRings: showFriendlyRadarRingsConfig
  } = MapStateContainer.useContainer();

  const { group, groupOnClick } = props;

  const { sessionCoalition, groupCoalition } = React.useContext(CoalitionContext);
  const colorPalette = React.useContext(ColorPaletteContext);
  const legendContext = React.useContext(LegendContext);
  const isSameCoalition = sessionCoalition === groupCoalition;
  const { selectedGroupId, selectedUnitId } = React.useContext(ModeContext);

  const isSelectedUnitLeadOfFlight = !commanderMode && isLeadOfFlight(selectedUnitId, group);
  const isAI = isSkillAI(group.units[0].skill);
  const isSelected = group.id === selectedGroupId;
  const isShowOtherFlightPlans = showOtherFlightPlans && !isAI;
  const isShowAIFlightPlans = showAIFlightPlans && isAI;
  const isVisible = isSelected || isShowOtherFlightPlans || isShowAIFlightPlans;
  const showRoute = isSameCoalition && isVisible;

  const onClick = () => groupOnClick?.(group, { coalition: groupCoalition });

  const renderGroupRoute = () => {
    const color = colorPalette[group.id % colorPalette.length];
    const isSelected = group.id === selectedGroupId;
    const isCommanderSelected = commanderMode && isSelected;
    const isPilotSelected = isSelectedUnitLeadOfFlight;
    const isRouteEditable = selectedGroupId !== undefined && (isCommanderSelected || isPilotSelected);

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

  const showThreatRings =
    (showThreatRingsConfig && !isSameCoalition) || (showFriendlyThreatRingsConfig && isSameCoalition);
  const showRadarRings =
    (showRadarRingsConfig && !isSameCoalition) || (showFriendlyRadarRingsConfig && isSameCoalition);

  return (
    <React.Fragment>
      {showUnits ? (
        group.units.map((unit, index) => (
          <React.Fragment key={`dcs_unit_${unit.id}_${index}`}>
            <DcsUnit unit={unit} unitOnClick={onClick} />
            {showThreatRings && <DcsUnitThreatRing unit={unit} />}
            {showRadarRings && <DcsUnitRadarRing unit={unit} />}
          </React.Fragment>
        ))
      ) : (
        <React.Fragment>
          <DcsUnit unit={group.units[0]} unitOnClick={onClick} />
          {showThreatRings && <DcsGroupThreatRing group={group} />}
          {showRadarRings && <DcsGroupRadarRing group={group} />}
        </React.Fragment>
      )}
      {showRoute && renderGroupRoute()}
    </React.Fragment>
  );
}
