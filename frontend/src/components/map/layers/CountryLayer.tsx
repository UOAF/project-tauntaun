import React from 'react';

import { Country } from '../../../models';
import { CategoryContext } from './contexts';
import { GroupLayer } from './GroupLayer';

export type CountryLayerProps = {
  country: Country;
};

export function CountryLayer(props: CountryLayerProps) {
  const { country } = props;

  return (
    <React.Fragment>
      <CategoryContext.Provider value={'helicopter_group'}>
        <GroupLayer groups={country.helicopter_group} />
      </CategoryContext.Provider>
      <CategoryContext.Provider value={'plane_group'}>
        <GroupLayer groups={country.plane_group} />
      </CategoryContext.Provider>
      <CategoryContext.Provider value={'ship_group'}>
        <GroupLayer groups={country.ship_group} />
      </CategoryContext.Provider>
      <CategoryContext.Provider value={'static_group'}>
        <GroupLayer groups={country.static_group} />
      </CategoryContext.Provider>
      <CategoryContext.Provider value={'vehicle_group'}>
        <GroupLayer groups={country.vehicle_group} />
      </CategoryContext.Provider>
    </React.Fragment>
  );
}
