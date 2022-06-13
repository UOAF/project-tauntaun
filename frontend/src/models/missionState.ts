import { useState } from 'react';

import { Mission, emptyMission, findGroupById, getGroupOfUnit } from './';
import { gameService } from '../services';
import { GenericUpdateMessage } from '../services/gameService';
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

  const onGenericUpdate = (message: GenericUpdateMessage) => {
    console.debug('Got generic update:', message.key);
    if (message.key === 'route_update') {
      setState(state => {
        const updatedMission = { ...state.mission };
        const group = findGroupById(updatedMission, message.group_id);

        if (group === undefined) {
          console.error(`route_update, group not found! id: ${message.group_id}`);
          return { ...state };
        }

        group.points = message.points;

        return {
          ...state,
          mission: updatedMission
        };
      });

    } else if (message.key === 'bullseye_update') {
      setState(state => {
        const updatedMission = { ...state.mission };
        updatedMission.coalition[message.coalition.name].bullseye = message.bullseye;

        return {
          ...state,
          mission: updatedMission
        };
      });

    } else if (message.key === 'unit_update') {
      setState(state => {
        const updatedMission = { ...state.mission };

        const group = getGroupOfUnit(updatedMission, message.id);
        if (group === undefined) {
          console.error(`unit_update, group not found for unit! id: ${message.id}`);
          return { ...state };
        }

        const unit_index = group.units.findIndex(u => u.id === message.id);

        group.units[unit_index] = message.unit;

        return {
          ...state,
          mission: updatedMission
        };
      });

    } else {
      console.info(`unhandled generic update`);
    }
  };

  const initialize = async (): Promise<void> => {
    try {
      if (state.isInitialized) {
        return;
      }

      gameService.registerForMissionUpdates(onMissionUpdate);
      gameService.registerForGenericUpdates(onGenericUpdate);
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
