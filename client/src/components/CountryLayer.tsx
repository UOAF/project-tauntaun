import React from 'react';

import { Country, Group } from '../models';
import { GroupLayer } from './GroupLayer';

export type CountryLayerProps = {
  country: Country;
  selectedGroupId: number | undefined;
  groupMarkerOnClick?: (group: Group) => void;
};

export function CountryLayer(props: CountryLayerProps) {
  const { country, selectedGroupId, groupMarkerOnClick } = props;

  return (
    <div>
      <GroupLayer
        groups={country.helicopter_group}
        displayRouteForGroup={selectedGroupId}
        groupMarkerOnClick={groupMarkerOnClick}
      />
      <GroupLayer
        groups={country.plane_group}
        displayRouteForGroup={selectedGroupId}
        groupMarkerOnClick={groupMarkerOnClick}
      />
      <GroupLayer
        groups={country.ship_group}
        displayRouteForGroup={selectedGroupId}
        groupMarkerOnClick={groupMarkerOnClick}
      />
      <GroupLayer
        groups={country.static_group}
        displayRouteForGroup={selectedGroupId}
        groupMarkerOnClick={groupMarkerOnClick}
      />
      <GroupLayer
        groups={country.vehicle_group}
        displayRouteForGroup={selectedGroupId}
        groupMarkerOnClick={groupMarkerOnClick}
      />
    </div>
  );
}
