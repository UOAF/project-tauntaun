import React from 'react';
import { Map, TileLayer } from 'react-leaflet';

import { pick } from 'lodash';

export interface CampaignMapProps {
  tileLayerUrl: string;
  lat: number;
  lng: number;
  zoom: number;
}

export function CampaignMap(props: CampaignMapProps) {
  return (
    <div data-testid="campaign-map">
      <Map center={pick(props, ['lat', 'lng'])} zoom={props.zoom}>
        <TileLayer
          url={props.tileLayerUrl}
          id="bobmoretti.3zp0vycr"
          maxZoom={13}
          attribution={
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
          }
        />
      </Map>
    </div>
  );
}
