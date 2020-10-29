import React, { ReactElement } from 'react';
import { CoalitionContext } from '..';

import {
  Group,
  AppStateContainer,
  matchCategoryToStaticCategory,
  Unit,
  DcsStaticData,
  MapStateContainer,
  Skill
} from '../../../../models';
import { GroupThreatRing } from '../markers/GroupThreatRing';
import { UnitMarker } from '../markers/UnitMarker';
import * as DcsStaticRawJson from '../../../../data/dcs_static.json';
import { CategoryContext, ColorContext } from '../contexts';
import { filter } from 'lodash';
import { ColorPaletteContext, LegendContext } from '../../contexts';
import { isLeadOfFlight } from '../../../common';
import { ModeContext } from '../../../contexts';
import { GroupRoute } from '../lines/GroupRoute';

export type GroupProps = {
  group: Group;
  groupOnClick?: (group: Group, event: any) => void;
};

export function DcsGroup(props: GroupProps): ReactElement {
  const DcsStatic = (DcsStaticRawJson as any).default as DcsStaticData;
  const { commanderMode, coalition } = AppStateContainer.useContainer();
  const {
    showOtherFlightPlans,
    showAIFlightPlans,
    showOtherWpNames,
    showUnits,
    showThreatRings: showThreatRingsConfig,
    showFriendlyThreatRings: showFriendlyThreatRingsConfig
  } = MapStateContainer.useContainer();

  const { group, groupOnClick } = props;

  const groupCoalition = React.useContext(CoalitionContext);
  const groupCategory = React.useContext(CategoryContext);
  const colorPalette = React.useContext(ColorPaletteContext);
  const legendContext = React.useContext(LegendContext);
  const isSameCoalition = coalition === groupCoalition;
  const { selectedGroupId, selectedUnitId } = React.useContext(ModeContext);

  const showThreatRings =
    (showThreatRingsConfig && !isSameCoalition) || (showFriendlyThreatRingsConfig && isSameCoalition);
  const isSelectedUnitLeadOfFlight = isLeadOfFlight(selectedUnitId, group);
  const isSelectedOrShowOther = group.id === selectedGroupId || showOtherFlightPlans;
  const isClientOrShowAI = group.units[0].skill === Skill.Client || showAIFlightPlans;
  const showRoute = isSameCoalition && isSelectedOrShowOther && isClientOrShowAI;

  const onClick = () => groupOnClick?.(group, { coalition: coalition });

  const getUnitLabel = (unit: Unit) => {
    const staticCategory = matchCategoryToStaticCategory(groupCategory);

    if (staticCategory === 'vehicles') {
      const staticUnit = filter(DcsStatic.vehicles, vehicle => vehicle.id === unit.type).pop();
      return staticUnit ? staticUnit.name : unit.type;
    }

    return unit.type;
  };

  const renderGroupRoute = () => {
    const color = colorPalette[group.id % colorPalette.length];
    const isSelected = group.id === selectedGroupId;
    const isRouteEditable =
      selectedGroupId !== undefined && (commanderMode || (isSelectedUnitLeadOfFlight && isSelected));

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

  return (
    <React.Fragment>
      {showUnits ? renderAllUnits() : renderFirstUnit()}
      {showRoute && renderGroupRoute()}
    </React.Fragment>
  );
}
