import React from 'react';

import { Country } from '../models';
import { GroupLayer } from './GroupLayer';

export type CountryLayerProps = {
  country: Country;
};

export function CountryLayer(props: CountryLayerProps) {
  const { country } = props;

  return (
    <div>
      <GroupLayer groups={country.helicopter_group} />
      <GroupLayer groups={country.plane_group} />
      <GroupLayer groups={country.ship_group} />
      <GroupLayer groups={country.static_group} />
      <GroupLayer groups={country.vehicle_group} />
    </div>
  );
}
