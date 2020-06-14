import L from 'leaflet';
import { useState } from 'react';
import { createContainer } from 'unstated-next';

import { Unit } from './unit';
import { gameService } from '../services/gameService';

export interface AppState {
  isInitialized: boolean;
  units: Unit[];
}

const defaultState: AppState = {
  isInitialized: false,
  units: []
};

function useAppState(initialState = defaultState) {
  const [state, setState] = useState(initialState);

  const refreshUnits = async (): Promise<void> => {
    const [ships, planes] = await Promise.all([gameService.getShips('blue'), gameService.getPlanes('blue')]);
    setState({
      ...state,
      units: [...ships, ...planes],
      isInitialized: true
    });
  };

  const onUnitUpdate = (updatedUnit: Unit) => {
    console.info(`got unit update`, updatedUnit);
  };

  const initialize = async (): Promise<void> => {
    try {
      if (state.isInitialized) {
        return;
      }

      (L as any).PM.initialize({ optIn: false });

      gameService.registerForUnitUpdates(onUnitUpdate);
      await gameService.openSocket();
      console.info('update socket connected');

      await refreshUnits();
      console.info('app state initialized');
    } catch (error) {
      console.error(`couldn't initialize appState`, error);
      throw error;
    }
  };

  const updateUnit = (unit: Unit) => {
    const units = state.units.filter(u => u.uniqueId !== unit.uniqueId);
    setState({
      ...state,
      units: [...units, unit]
    });
  };

  return { ...state, initialize, refreshUnits, updateUnit };
}

export const AppStateContainer = createContainer(useAppState);
