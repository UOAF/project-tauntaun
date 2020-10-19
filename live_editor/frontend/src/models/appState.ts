import { LatLng } from 'leaflet';
import { useState } from 'react';
import { createContainer } from 'unstated-next';
import { Coalitions } from '.';
import { useMapState } from './mapState';
import { useMissionState } from './missionState';
import { useSelectionState } from './selectionState';
import { useSessionState } from './sessionState';

export interface AppState {
  adminMode: boolean;

  showAddFlightForm: boolean;
  location: LatLng;

  showLoadoutEditor: boolean;

  showBriefingForm: boolean;

  coalition: string;
}

const defaultState: AppState = {
  adminMode: false,
  showAddFlightForm: false,
  location: new LatLng(0, 0),
  showLoadoutEditor: false,
  showBriefingForm: false,
  coalition: Coalitions.BLUE
};

function useAppState(initialState = defaultState) {
  const [state, setState] = useState(initialState);
  const [initialized, setInitialized] = useState(false);
  const missionState = useMissionState();
  const sessionState = useSessionState();
  const mapState = useMapState();
  const selectionState = useSelectionState();

  const initialize = async (): Promise<void> => {
    try {
      if (initialized) {
        return;
      }

      await missionState.initialize();
      await sessionState.initialize();

      setInitialized(true);
      console.info('AppState initialized');
    } catch (error) {
      console.error(`couldn't initialize AppState`, error);
      throw error;
    }
  };

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

  const setShowBriefingForm = (visible: boolean) => {
    setState(state => ({
      ...state,
      showBriefingForm: visible
    }));
  };

  const setCoalition = (coalition: string) => {
    setState(state => ({
      ...state,
      coalition: coalition
    }));
  };

  return {
    ...state,
    initialize,
    setAdminMode,
    setShowLoadoutEditor,
    setLocation,
    setShowAddFlightForm,
    setShowBriefingForm,
    setCoalition,
    session: {
      ...sessionState
    },
    mission: {
      ...missionState
    },
    map: {
      ...mapState
    },
    selection: {
      ...selectionState
    }
  };
}

export const AppStateContainer = createContainer(useAppState);
