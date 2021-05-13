import './App.css';

import React, { useEffect, useState } from 'react';

import {
  AppStateContainer,
  DcsStaticDataStateContainer,
  Group,
  MapStateContainer,
  MissionStateContainer,
  SelectionStateContainer,
  SessionStateContainer
} from '../models';
import { findGroupById, getGroupOfUnit } from '../models/dcs_util';
import { gameService } from '../services';
import { ModeContext, ModeContextType } from './contexts';
import { AddFlightForm, RoleSelectionForm, EditWaypointForm, LoadoutEditor } from './window/forms';
import { MenuBar } from './menu';
import { CampaignMap } from './map';
import { RoleOverview } from './window/RoleOverview';
import { MissionTime } from './ui/MissionTime';
import { HelpBar } from './menu/HelpBar';
import { LoadMissionForm } from './window/forms/LoadMissionForm';
import { SaveAsMissionForm } from './window/forms/SaveAsMissionForm';
import { Version } from './ui/Version';

enum InitialzationState {
  UNINITIALIZED,
  INITIALIZED,
  INITIALIZATION_FAILED
}

export function App() {
  const {
    showAddFlightForm,
    showRoleSelectionForm: showRoleSelectionFormConfig,
    commanderMode,
    showLoadoutEditor,
    showRoleOverview,
    showLoadMissionForm,
    showSaveAsMissionForm
  } = AppStateContainer.useContainer();

  const { mission, initialize: initializeMission } = MissionStateContainer.useContainer();
  const { mapToken, initialize: initializeMap } = MapStateContainer.useContainer();
  const { initialize: initializeDcsStaticData } = DcsStaticDataStateContainer.useContainer();
  const { sessions, sessionId, initialize: initializeSession } = SessionStateContainer.useContainer();
  const {
    selectedWaypoint,
    selectedGroupId: selectedGroupIdCommanderMode,
    selectedUnitId: selectedUnitIdCommanderMode,
    selectGroup
  } = SelectionStateContainer.useContainer();
  const sessionData = sessions[sessionId];
  const sessionCoalition = sessionData ? sessionData.coalition : '';

  const [initializedState, setInitializedState] = useState(InitialzationState.UNINITIALIZED);
  const [connected, setConnected] = useState(false);

  const onConnectionClosed = () => {
    console.log('Websocket closed!');
    setConnected(false);
  };

  useEffect(() => {
    if (initializedState !== InitialzationState.UNINITIALIZED) return;

    const initApp = async () => {
      try {
        gameService.registerForOnClose(onConnectionClosed);
        await gameService.openSocket();
        console.info('GameService initialized');
        setConnected(true);
        await initializeDcsStaticData();
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

    initApp();
  }, []);

  const groupMarkerOnClick = (group: Group, event: any): void => {
    if (!commanderMode) return;

    if (event && event.coalition !== sessionCoalition) return;

    console.info(`selecting group`, group);

    selectGroup(selectedGroupId === group.id ? undefined : group.id);
  };

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

  const showRoleSelectionForm = sessionData !== undefined && !commanderMode && showRoleSelectionFormConfig;

  const renderApp = () => {
    return (
      <React.Fragment>
        {mapToken ? (
          <React.Fragment>
            <ModeContext.Provider value={modeContext}>
              <section className="App">
                <header>
                  <div className="titleVersion">
                    <h1>Project TaunTaun</h1>
                    <Version />
                  </div>
                  <div>
                    <MissionTime />
                  </div>
                </header>
                <MenuBar />
                <main>
                  {showRoleOverview && <RoleOverview />}
                  {showRoleSelectionForm && <RoleSelectionForm />}
                  {showAddFlightForm && <AddFlightForm />}
                  {selectedGroupId !== undefined && selectedWaypoint !== undefined && group && (
                    <EditWaypointForm group={group} pointIndex={selectedWaypoint} />
                  )}
                  {showLoadoutEditor && unit && <LoadoutEditor unit={unit} />}
                  {showLoadMissionForm && <LoadMissionForm />}
                  {showSaveAsMissionForm && <SaveAsMissionForm />}
                </main>
                <footer>
                  <HelpBar />
                </footer>
              </section>
              <section className="mapContainer">
                <CampaignMap lat={terrain.map_view_default.lat} lng={terrain.map_view_default.lon} zoom={9} />
              </section>
            </ModeContext.Provider>
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
      return (
        <div>
          <h1>Project Tauntaun</h1>
          <p>Loading...</p>
        </div>
      );
    case InitialzationState.INITIALIZATION_FAILED:
      return (
        <div>
          <h1>Project Tauntaun</h1>
          <p>Something went wrong, unable to connect to server or initialize app.</p>
        </div>
      );
    case InitialzationState.INITIALIZED: {
      if (!connected)
        return (
          <div>
            <h1>Project Tauntaun</h1>
            <p>Disconnected from server refresh page in order to reconnect.</p>
          </div>
        );
      else return renderApp();
    }
  }
}
