import React from 'react';
import { Map, TileLayer } from 'react-leaflet';
import { pick } from 'lodash';

import { Mission, Group } from '../models';
import { CoalitionLayer } from './CoalitionLayer';
import { LeafletMouseEvent } from 'leaflet';

export interface CampaignMapProps {
  tileLayerUrl: string;
  lat: number;
  lng: number;
  zoom: number;
  mission: Mission;
  selectedGroupId: number | undefined;
  onMapClick?: (e: LeafletMouseEvent) => void;
  groupMarkerOnClick?: (group: Group) => void;
}

export function CampaignMap(props: CampaignMapProps) {
  const { mission, selectedGroupId, groupMarkerOnClick } = props;

  return (
    <div data-testid="campaign-map">
      <Map center={pick(props, ['lat', 'lng'])} zoom={props.zoom} onclick={props.onMapClick}>
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
        {Object.keys(mission.coalition).map(key => (
          <CoalitionLayer
            key={key}
            coalition={mission.coalition[key]}
            selectedGroupId={selectedGroupId}
            groupMarkerOnClick={groupMarkerOnClick}
          />
        ))}
      </Map>
    </div>
  );
}
