import React from 'react';

import { Dictionary } from '../../../models/util';
import { Airport } from '../../../models/dcs';
import { map } from 'lodash';
import { AirportMarker } from './markers/AirportMarker';

export type AirportLayerProps = {
  airports: Dictionary<Airport>;
};

export function AirportLayer(props: AirportLayerProps) {
  const { airports } = props;

  return (
    <React.Fragment>
      {map(airports, (airport, i) => (
        <AirportMarker key={`airports${airport}${i}`} airport={airport} />
      ))}
    </React.Fragment>
  );
}
