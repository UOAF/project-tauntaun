import { useState } from 'react';

import { gameService } from '../services';
import { Sessions } from './sessionData';

export interface SessionState {
  isInitialized: boolean;

  sessionId: number;
  sessions: Sessions;
}

const defaultState: SessionState = {
  isInitialized: false,
  sessionId: -1,
  sessions: {}
};

export function useSessionState(initialState = defaultState) {
  const [state, setState] = useState(initialState);

  const refreshSessions = async (): Promise<void> => {
    const sessions = await gameService.getSessions();
    setState(state => ({
      ...state,
      sessions: sessions
    }));
  };

  const onSessionIdUpdateReceived = (sessionId: number) => {
    setState(state => {
      return {
        ...state,
        sessionId: sessionId
      };
    });

    console.info(`got sessionId data`);
  };

  const onSessionsUpdateReceived = (sessions: Sessions) => {
    setState(state => {
      return {
        ...state,
        sessions: sessions
      };
    });

    console.info(`got sessions update`);
  };

  const initialize = async (): Promise<void> => {
    try {
      if (state.isInitialized) {
        return;
      }

      await refreshSessions();
      gameService.registerForSessionsUpdate(onSessionsUpdateReceived);

      gameService.registerForSessionIdUpdate(onSessionIdUpdateReceived);
      gameService.requestSessionId();

      setState(state => ({
        ...state,
        isInitialized: true
      }));
      console.info('SessionState initialized');
    } catch (error) {
      console.error(`couldn't initialize SessionState`, error);
      throw error;
    }
  };

  return {
    ...state,
    initialize
  };
}
