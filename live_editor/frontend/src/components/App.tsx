import './App.css';

import React, { useEffect } from 'react';

import { AppStateContainer, Coalitions, Group } from '../models';
import { findGroupById, getGroupOfUnit } from '../models/dcs_util';
import { gameService } from '../services';
import L from 'leaflet';
import { MapContext, MapContextType, ModeContext, ModeContextType } from './contexts';
import { AddFlightForm, BriefingForm, EditWaypointForm, LoadoutEditor } from './forms';
import { MenuBar } from './menu';
import { CampaignMap } from './map';

export function App() {
  const {
    showAddFlightForm,
    showBriefingForm: showBriefingFormConfig,
    adminMode,
    showLoadoutEditor,
    mission: missionState,
    session: sessionState,
    selection,
    initialize
  } = AppStateContainer.useContainer();
  const { mission } = missionState;
  const { sessions, sessionId } = sessionState;
  const {
    selectedWaypoint,
    selectedGroupId: selectedGroupIdAdminMode,
    selectedUnitId: selectedUnitIdAdminMode,
    selectGroup
  } = selection;

  useEffect(() => {
    const initGameService = async () => {
      await gameService.openSocket();
      console.info('update socket connected');
    };

    (L as any).PM.initialize({ optIn: false });

    initGameService();
    initialize();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const groupMarkerOnClick = (group: Group, event: any): void => {
    if (!adminMode) return;

    if (event && event.coalition !== Coalitions.BLUE) return;

    console.info(`selecting group`, group);

    selectGroup(selectedGroupId === group.id ? undefined : group.id);
  };

  const sessionData = sessions[sessionId];
  const selected_unit_id = sessionData
    ? sessionData.selected_unit_id !== -1
      ? sessionData.selected_unit_id
      : undefined
    : undefined;

  const modeContext = {
    groupOnClick: groupMarkerOnClick,
    selectedGroupId: adminMode ? selectedGroupIdAdminMode : getGroupOfUnit(mission, selected_unit_id)?.id,
    selectedUnitId: adminMode ? selectedUnitIdAdminMode : selected_unit_id
  } as ModeContextType;

  const { selectedGroupId, selectedUnitId } = modeContext;

  const group = selectedGroupId ? findGroupById(mission, selectedGroupId) : undefined;
  const unit = group && selectedUnitId ? group.units.find(u => u.id === selectedUnitId) : undefined;
  const terrain = mission.terrain;

  const showBriefingForm = sessionData !== undefined && !adminMode && showBriefingFormConfig;

  return (
    <React.Fragment>
      <MapContext.Provider value={{ map: undefined } as MapContextType}>
        <ModeContext.Provider value={modeContext}>
          {showBriefingForm && <BriefingForm />}
          {showAddFlightForm && <AddFlightForm />}
          {selectedGroupId && selectedWaypoint && group && (
            <EditWaypointForm group={group} pointIndex={selectedWaypoint} />
          )}
          {showLoadoutEditor && unit && <LoadoutEditor unit={unit} />}
          <MenuBar />
          <CampaignMap lat={terrain.map_view_default.lat} lng={terrain.map_view_default.lon} zoom={9} />
        </ModeContext.Provider>
      </MapContext.Provider>
    </React.Fragment>
  );
}
