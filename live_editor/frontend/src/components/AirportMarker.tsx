import React from 'react';

import { Airport } from '../models';
import { SidcMarker } from './SidcMarker';
import { changeSidcCoalition } from '../models/dcs_util';

export type AirportProps = {
  airport: Airport;
  airportMarkerOnClick?: (airport: Airport) => void;
};

export function AirportMarker(props: AirportProps) {
  const { airport, airportMarkerOnClick } = props;

  const sidc = changeSidcCoalition('SFGPIBA---H-', airport.coalition);
  const { lat, lon: lng } = airport.position;

  const onClick = () => {
    if (airportMarkerOnClick) {
      airportMarkerOnClick(airport);
    }
  };

  return <SidcMarker position={{ lat, lng }} sidc={sidc} name={airport.name} onclick={onClick} />;
}
