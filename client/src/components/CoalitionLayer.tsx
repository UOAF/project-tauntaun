import React, { createContext } from 'react';

import { Coalition } from '../models';
import { CountryLayer } from './CountryLayer';

export type CoalitionLayerProps = {
  coalition: Coalition;
};

export const CoalitionContext = createContext('');

export function CoalitionLayer(props: CoalitionLayerProps) {
  const { coalition } = props;

  return (
    <CoalitionContext.Provider value={coalition.name}>
      {Object.keys(coalition.countries).map(countryKey => (
        <CountryLayer
          key={countryKey}
          country={coalition.countries[countryKey]}
        />
      ))}
    </CoalitionContext.Provider>
  );
}
