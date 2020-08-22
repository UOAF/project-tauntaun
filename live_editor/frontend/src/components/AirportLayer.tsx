import React, { createContext } from 'react';

import { Dictionary } from '../models/util';
import { Airport } from '../models/dcs';
import { map } from 'lodash';
import { AirportMarker } from './AirportMarker';

export type AirportLayerProps = {
  airports: Dictionary<Airport>;
};

export const CoalitionContext = createContext('');

export function AirportLayer(props: AirportLayerProps) {
  const { airports } = props;

  return (
    <div>
      {map(airports, airport => 
        (<AirportMarker airport={airport} />)
      )}
    </div>
  );
}
