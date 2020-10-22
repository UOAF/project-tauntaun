import { useState } from 'react';

import { Mission, emptyMission } from './';
import { gameService } from '../services';
import { createContainer } from 'unstated-next';

export interface MissionState {
  isInitialized: boolean;
  mission: Mission;
}

const defaultState: MissionState = {
  isInitialized: false,
  mission: emptyMission
};

export function useMissionState(initialState = defaultState) {
  const [state, setState] = useState(initialState);

  const refreshMission = async (): Promise<void> => {
    const mission = await gameService.getMission();
    setState(state => ({
      ...state,
      mission: mission
    }));
  };

  const onMissionUpdate = (updatedMission: Mission) => {
    setState(state => {
      return {
        ...state,
        mission: updatedMission
      };
    });

    console.info(`got mission update`);
  };

  const initialize = async (): Promise<void> => {
    try {
      if (state.isInitialized) {
        return;
      }

      gameService.registerForMissionUpdates(onMissionUpdate);
      await refreshMission();

      setState(state => ({
        ...state,
        isInitialized: true
      }));
      console.info('MissionState initialized');
    } catch (error) {
      console.error(`couldn't initialize MissionState`, error);
      throw error;
    }
  };

  return {
    ...state,
    initialize
  };
}

export const MissionStateContainer = createContainer(useMissionState);
