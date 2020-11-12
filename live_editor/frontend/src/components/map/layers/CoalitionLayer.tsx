import React, { createContext } from 'react';

import { Coalition, SessionStateContainer } from '../../../models';
import { CountryLayer } from './CountryLayer';

export type CoalitionLayerProps = {
  coalition: Coalition;
};

export type CoalitionContext = {
  sessionCoalition: string;
  groupCoalition: string;
};

export const CoalitionContext = createContext({} as CoalitionContext);

export function CoalitionLayer(props: CoalitionLayerProps) {
  const { coalition } = props;

  const { sessionId, sessions } = SessionStateContainer.useContainer();
  const sessionData = sessions[sessionId];
  const sessionCoalition = sessionData ? sessionData.coalition : '';

  return (
    <CoalitionContext.Provider value={{ sessionCoalition: sessionCoalition, groupCoalition: coalition.name }}>
      {Object.keys(coalition.countries).map(countryKey => (
        <CountryLayer key={countryKey} country={coalition.countries[countryKey]} />
      ))}
    </CoalitionContext.Provider>
  );
}
