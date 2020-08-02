import React from 'react';

import { Coalition } from '../models';
import { CountryLayer } from './CountryLayer';


export type CoalitionLayerProps = {
  coalition: Coalition;
  selectedGroupId: number | undefined;
};

export function CoalitionLayer(props: CoalitionLayerProps) { 
  const { coalition, selectedGroupId } = props;  

  return (
    <div>
        {Object.keys(coalition.countries).map(countryKey => (
        <CountryLayer key={countryKey} country={coalition.countries[countryKey]} selectedGroupId={selectedGroupId} />
        ))}    
    </div>
  );  
}
