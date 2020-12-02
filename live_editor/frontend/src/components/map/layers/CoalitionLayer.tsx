import React, { createContext } from 'react';

import { AppStateContainer, Coalition, SessionStateContainer } from '../../../models';
import { CountryLayer } from './CountryLayer';
import { BullseyeMarker } from './markers/BullseyeMarker';
import { LatLng, LeafletEvent } from 'leaflet';
import { gameService } from '../../../services/gameService';

export type CoalitionLayerProps = {
  coalition: Coalition;
};

export type CoalitionContext = {
  sessionCoalition: string;
  groupCoalition: string;
};

export const CoalitionContext = createContext({} as CoalitionContext);

export function CoalitionLayer(props: CoalitionLayerProps) {
  const { commanderMode } = AppStateContainer.useContainer();
  const { coalition } = props;

  const { lat, lon } = coalition.bullseye;
  const bullseye = new LatLng(lat, lon);

  const { sessionId, sessions } = SessionStateContainer.useContainer();
  const sessionData = sessions[sessionId];
  const sessionCoalition = sessionData ? sessionData.coalition : '';
  const showBullseye = sessionCoalition === coalition.name;

  const onMarkerDragEnd = (event: LeafletEvent) => {
    const latlng = event.target._latlng;
    if (!commanderMode) {
      return;
    }

    gameService.sendSetBullseye(coalition.name, latlng);
  };

  return (
    <CoalitionContext.Provider value={{ sessionCoalition: sessionCoalition, groupCoalition: coalition.name }}>
      {Object.keys(coalition.countries).map(countryKey => (
        <CountryLayer key={countryKey} country={coalition.countries[countryKey]} />
      ))}
      {showBullseye && <BullseyeMarker position={bullseye} ondragend={onMarkerDragEnd} draggable={commanderMode} />}
    </CoalitionContext.Provider>
  );
}
