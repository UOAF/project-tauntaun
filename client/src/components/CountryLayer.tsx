import React from 'react';

import { Country } from '../models';
import { GroupLayer } from './GroupLayer';


export type CountryLayerProps = {
  country: Country;
  selectedGroupId: number | undefined;
};

export function CountryLayer(props: CountryLayerProps) { 
  const { country, selectedGroupId } = props;  

  return (
    <div>
        <GroupLayer groups={country.helicopter_group} selectedGroupId={selectedGroupId} />        
        <GroupLayer groups={country.plane_group} selectedGroupId={selectedGroupId} />        
        <GroupLayer groups={country.ship_group} selectedGroupId={selectedGroupId} />        
        <GroupLayer groups={country.static_group} selectedGroupId={selectedGroupId} />        
        <GroupLayer groups={country.vehicle_group} selectedGroupId={selectedGroupId} />        
    </div>
  );  
}
