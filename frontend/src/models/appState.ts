import { LatLng } from 'leaflet';
import { useState } from 'react';
import { createContainer } from 'unstated-next';

export interface AppState {
  adminMode: boolean;
  commanderMode: boolean;

  showAddFlightForm: boolean;
  location: LatLng;

  showLoadoutEditor: boolean;

  showRoleSelectionForm: boolean;

  showRoleOverview: boolean;

  showLoadMissionForm: boolean;

  showSaveAsMissionForm: boolean;
}

const defaultState: AppState = {
  adminMode: false,
  commanderMode: false,
  showAddFlightForm: false,
  location: new LatLng(0, 0),
  showLoadoutEditor: false,
  showRoleSelectionForm: true,
  showRoleOverview: false,
  showLoadMissionForm: false,
  showSaveAsMissionForm: false
};

function useAppState(initialState = defaultState) {
  const [state, setState] = useState(initialState);

  const setLocation = (location: LatLng) => {
    setState(state => ({
      ...state,
      location: location
    }));
  };

  const setAdminMode = (adminMode: boolean) => {
    setState(state => ({
      ...state,
      adminMode: adminMode
    }));
  };

  const setShowLoadoutEditor = (visible: boolean) => {
    setState(state => ({
      ...state,
      showLoadoutEditor: visible
    }));
  };

  const setShowAddFlightForm = (visible: boolean) => {
    setState(state => ({
      ...state,
      showAddFlightForm: visible
    }));
  };

  const setShowRoleSelectionForm = (visible: boolean) => {
    setState(state => ({
      ...state,
      showRoleSelectionForm: visible
    }));
  };

  const setCommanderMode = (commanderMode: boolean) => {
    setState(state => ({
      ...state,
      commanderMode: commanderMode
    }));
  };

  const setShowRoleOverview = (showRoleOverview: boolean) => {
    setState(state => ({
      ...state,
      showRoleOverview: showRoleOverview
    }));
  };

  const setShowLoadMissionForm = (showLoadMissionForm: boolean) => {
    setState(state => ({
      ...state,
      showLoadMissionForm: showLoadMissionForm
    }));
  };

  const setShowSaveAsMissionForm = (showSaveAsMissionForm: boolean) => {
    setState(state => ({
      ...state,
      showSaveAsMissionForm: showSaveAsMissionForm
    }));
  };

  return {
    ...state,
    setAdminMode,
    setShowLoadoutEditor,
    setLocation,
    setShowAddFlightForm,
    setShowRoleSelectionForm,
    setShowRoleOverview,
    setCommanderMode,
    setShowLoadMissionForm,
    setShowSaveAsMissionForm
  };
}

export const AppStateContainer = createContainer(useAppState);
