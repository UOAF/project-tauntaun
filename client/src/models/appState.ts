import L from 'leaflet';
import { useState } from 'react';
import { createContainer } from 'unstated-next';
import { without } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { Unit } from './';
import { gameService } from '../services';

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
    setState(state => ({
      ...state,
      units: [...ships, ...planes]
    }));
  };

  const onUnitUpdate = (updatedUnit: Unit) => {
    setState(state => {
      const oldUnit = state.units.find(u => u.id === updatedUnit.id && u.name === updatedUnit.name);
      const units = oldUnit ? without(state.units, oldUnit) : state.units;

      return {
        ...state,
        units: [
          ...units,
          {
            ...updatedUnit,
            uniqueId: oldUnit ? oldUnit.uniqueId : uuidv4(),
            isSelected: oldUnit ? oldUnit.isSelected : false
          }
        ]
      };
    });

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
      setState(state => ({
        ...state,
        isInitialized: true
      }));
      console.info('app state initialized');
    } catch (error) {
      console.error(`couldn't initialize appState`, error);
      throw error;
    }
  };

  const updateUnit = (unit: Unit) => {
    const units = state.units.filter(u => u.uniqueId !== unit.uniqueId);
    setState(state => ({
      ...state,
      units: [...units, unit]
    }));
  };

  return { ...state, initialize, refreshUnits, updateUnit };
}

export const AppStateContainer = createContainer(useAppState);
