import './Markers.css';

import React from 'react';

import { Airport, SessionStateContainer } from '../../../../models';
import { SidcMarker } from './SidcMarker';
import { setSidcCoalition, calcAffiliation } from '../../../../models/dcs_util';

export type AirportProps = {
  airport: Airport;
  airportMarkerOnClick?: (airport: Airport) => void;
};

export function AirportMarker(props: AirportProps) {
  const { sessionId, sessions } = SessionStateContainer.useContainer();
  const sessionData = sessions[sessionId];
  const sessionCoalition = sessionData ? sessionData.coalition : '';

  const { airport, airportMarkerOnClick } = props;

  const sidc = setSidcCoalition('SFGPIBA---H-', calcAffiliation(sessionCoalition, airport.coalition));
  const { lat, lon: lng } = airport.position;

  const onClick = () => airportMarkerOnClick?.(airport);

  return (
    <SidcMarker
      position={{ lat, lng }}
      sidc={sidc}
      label={airport.name}
      eventHandlers={{
        click: onClick
      }}
    />
  );
}
