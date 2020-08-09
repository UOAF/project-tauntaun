import React from 'react';

import { Coalition, Group } from '../models';
import { CountryLayer } from './CountryLayer';

export type CoalitionLayerProps = {
  coalition: Coalition;
  selectedGroupId: number | undefined;
  groupMarkerOnClick?: (group: Group) => void;
};

export function CoalitionLayer(props: CoalitionLayerProps) {
  const { coalition, selectedGroupId, groupMarkerOnClick } = props;

  return (
    <div>
      {Object.keys(coalition.countries).map(countryKey => (
        <CountryLayer
          key={countryKey}
          country={coalition.countries[countryKey]}
          selectedGroupId={selectedGroupId}
          groupMarkerOnClick={groupMarkerOnClick}
        />
      ))}
    </div>
  );
}
