import React from 'react';
import { Map, TileLayer } from 'react-leaflet';
import { pick } from 'lodash';

import { Mission } from '../models';
import { CoalitionLayer } from './CoalitionLayer';
import { LeafletMouseEvent } from 'leaflet';
import { AirportLayer } from './AirportLayer';
import { useState } from 'react';
import { ContextMenu, ClickPosition } from '.';
import { PointXY } from './ContextMenu';

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

  const [position, setPosition] = useState(null as ClickPosition | null);

  const onContextMenuClick = (event: any) => {
    setPosition({
      xy: {
        x: event.originalEvent.clientX,
        y: event.originalEvent.clientY
      } as PointXY,
      latlon: event.latlng
    } as ClickPosition);
  };

  return (
    <div data-testid="campaign-map">  
    {position && <ContextMenu position={position} />}
      <Map
        center={pick(props, ['lat', 'lng'])}
        zoom={props.zoom}
        onclick={props.onMapClick}
        oncontextmenu={onContextMenuClick}
      >
        <TileLayer
          url={props.tileLayerUrl}
          maxZoom={15}
          attribution={
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
          }
        />
        <AirportLayer airports={mission.terrain.airports} />
        {Object.keys(mission.coalition).map(key => (
          <CoalitionLayer key={key} coalition={mission.coalition[key]} />
        ))}
      </Map>
    </div>
  );
}
