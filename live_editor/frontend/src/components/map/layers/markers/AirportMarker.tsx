import React from 'react';

import { Airport, AppStateContainer } from '../../../../models';
import { SidcMarker } from './SidcMarker';
import { setSidcCoalition, calcAffiliation } from '../../../../models/dcs_util';

export type AirportProps = {
  airport: Airport;
  airportMarkerOnClick?: (airport: Airport) => void;
};

export function AirportMarker(props: AirportProps) {
  const { coalition } = AppStateContainer.useContainer();
  const { airport, airportMarkerOnClick } = props;

  const sidc = setSidcCoalition('SFGPIBA---H-', calcAffiliation(coalition, airport.coalition));
  const { lat, lon: lng } = airport.position;

  const onClick = () => airportMarkerOnClick?.(airport);

  return <SidcMarker position={{ lat, lng }} sidc={sidc} label={airport.name} onclick={onClick} />;
}
