import './App.css';

import React, { useEffect, useState } from 'react';

import {
  AppStateContainer,
  Coalitions,
  Group,
  MapStateContainer,
  MissionStateContainer,
  SelectionStateContainer,
  SessionStateContainer
} from '../models';
import { findGroupById, getGroupOfUnit } from '../models/dcs_util';
import { gameService } from '../services';
import L from 'leaflet';
import { MapContext, MapContextType, ModeContext, ModeContextType } from './contexts';
import { AddFlightForm, BriefingForm, EditWaypointForm, LoadoutEditor } from './window/forms';
import { MenuBar } from './menu';
import { CampaignMap } from './map';
import { RoleOverview } from './window/RoleOverview';
import { MissionTime } from './ui/MissionTime';

enum InitialzationState {
  UNINITIALIZED,
  INITIALIZED,
  INITIALIZATION_FAILED
}

export function App() {
  const {
    showAddFlightForm,
    showBriefingForm: showBriefingFormConfig,
    commanderMode,
    showLoadoutEditor,
    showRoleOverview
  } = AppStateContainer.useContainer();

  const { mission, initialize: initializeMission } = MissionStateContainer.useContainer();
  const { mapToken, initialize: initializeMap } = MapStateContainer.useContainer();
  const { sessions, sessionId, initialize: initializeSession } = SessionStateContainer.useContainer();
  const {
    selectedWaypoint,
    selectedGroupId: selectedGroupIdCommanderMode,
    selectedUnitId: selectedUnitIdCommanderMode,
    selectGroup
  } = SelectionStateContainer.useContainer();

  const [initializedState, setInitializedState] = useState(InitialzationState.UNINITIALIZED);

  useEffect(() => {
    if (initializedState !== InitialzationState.UNINITIALIZED) return;

    const initApp = async () => {
      try {
        await gameService.openSocket();
        console.info("GameService initialized");
        await initializeMap();
        await initializeMission();
        await initializeSession();

        console.info('App initialized successfully.');
        setInitializedState(InitialzationState.INITIALIZED);
      } catch (error) {
        console.info('Failed to initialize app.');
        setInitializedState(InitialzationState.INITIALIZATION_FAILED);
      }
    };

    (L as any).PM.initialize({ optIn: false });

    initApp();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const groupMarkerOnClick = (group: Group, event: any): void => {
    console.log(commanderMode);
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

  const renderApp = () => {
    return (
      <React.Fragment>
        {mapToken ? (
          <React.Fragment>
            <MapContext.Provider value={{ map: undefined } as MapContextType}>
              <ModeContext.Provider value={modeContext}>
                <MissionTime />
                {showRoleOverview && <RoleOverview />}
                {showBriefingForm && <BriefingForm />}
                {showAddFlightForm && <AddFlightForm />}
                {selectedGroupId !== undefined && selectedWaypoint !== undefined && group && (
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
  };

  switch (initializedState) {
    case InitialzationState.UNINITIALIZED:
      return <span>Loading...</span>;
    case InitialzationState.INITIALIZATION_FAILED:
      return <span>Something went wrong, unable to connect to server or initialize app.</span>;
    case InitialzationState.INITIALIZED:
      return renderApp();
  }
}
