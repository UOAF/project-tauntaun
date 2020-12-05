import { useState } from 'react';

import { DcsStaticData, emptyDcsStaticData } from '.';
import { gameService } from '../services';
import { createContainer } from 'unstated-next';

export interface DcsStaticDataState {
  isInitialized: boolean;
  dcsStaticData: DcsStaticData;
}

const defaultState: DcsStaticDataState = {
  isInitialized: false,
  dcsStaticData: emptyDcsStaticData
};

export function useDcsStaticDataState(initialState = defaultState) {
  const [state, setState] = useState(initialState);

  const refresh = async (): Promise<void> => {
    const staticData = await gameService.getStaticData();
    setState(state => ({
      ...state,
      dcsStaticData: staticData
    }));
  };

  const initialize = async (): Promise<void> => {
    try {
      if (state.isInitialized) {
        return;
      }

      await refresh();

      setState(state => ({
        ...state,
        isInitialized: true
      }));
      console.info('DcsStaticDataState initialized');
    } catch (error) {
      console.error(`couldn't initialize DcsStaticDataState`, error);
      throw error;
    }
  };

  return {
    ...state,
    initialize
  };
}

export const DcsStaticDataStateContainer = createContainer(useDcsStaticDataState);
