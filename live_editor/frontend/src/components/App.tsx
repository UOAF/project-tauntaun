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
    commanderMode,
    showLoadoutEditor,
    mission: missionState,
    session: sessionState,
    selection,
    mapToken,
    initialize
  } = AppStateContainer.useContainer();
  const { mission } = missionState;
  const { sessions, sessionId } = sessionState;
  const {
    selectedWaypoint,
    selectedGroupId: selectedGroupIdCommanderMode,
    selectedUnitId: selectedUnitIdCommanderMode,
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
    if (!commanderMode) return;

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
    selectedGroupId: commanderMode ? selectedGroupIdCommanderMode : getGroupOfUnit(mission, selected_unit_id)?.id,
    selectedUnitId: commanderMode ? selectedUnitIdCommanderMode : selected_unit_id
  } as ModeContextType;

  const { selectedGroupId, selectedUnitId } = modeContext;

  const group = selectedGroupId ? findGroupById(mission, selectedGroupId) : undefined;
  const unit = group && selectedUnitId ? group.units.find(u => u.id === selectedUnitId) : undefined;
  const terrain = mission.terrain;

  const showBriefingForm = sessionData !== undefined && !commanderMode && showBriefingFormConfig;

  return (
    <React.Fragment>
      {mapToken ? (
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
      ) : mapToken === undefined ? (
        <span>Loading...</span>
      ) : (
        <span>Empty map token, server is not configured.</span>
      )}
    </React.Fragment>
  );
}
