import React from 'react';
import { Map, TileLayer } from 'react-leaflet';
import { pick } from 'lodash';

import { Mission } from '../models';
import { CoalitionLayer } from './CoalitionLayer';
import { LeafletMouseEvent } from 'leaflet';
import { AirportLayer } from './AirportLayer';

export interface CampaignMapProps {
  tileLayerUrl: string;
  lat: number;
  lng: number;
  zoom: number;
  mission: Mission;
  onMapClick?: (e: LeafletMouseEvent) => void;
}

export function CampaignMap(props: CampaignMapProps) {
  const { mission } = props;

  return (
    <div data-testid="campaign-map">
      <Map center={pick(props, ['lat', 'lng'])} zoom={props.zoom} onclick={props.onMapClick}>
        <TileLayer
          url={props.tileLayerUrl}
          id="mapbox/streets-v11"
          maxZoom={15}
          attribution={
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
          }
        />        
        <AirportLayer airports={mission.terrain.airports}/>
        {Object.keys(mission.coalition).map(key => (
          <CoalitionLayer
            key={key}
            coalition={mission.coalition[key]}
          />
        ))}        
      </Map>
    </div>
  );
}
