import './CampaignMap.css';

import React from 'react';
import { Map, TileLayer } from 'react-leaflet';
import { pick } from 'lodash';

import { AppStateContainer } from '../../models';
import { LeafletMouseEvent } from 'leaflet';
import { useState } from 'react';
import { MapContext } from '../contexts';
import { ClickPosition, PointXY } from '../contextmenu';
import { LegendContext } from './contexts';
import { MapContextMenu } from './MapContextMenu';
import { AirportLayer, CoalitionLayer } from './layers';
import { Legend } from './Legend';

export interface CampaignMapProps {
  lat: number;
  lng: number;
  zoom: number;
  onMapClick?: (e: LeafletMouseEvent) => void;
}

export function CampaignMap(props: CampaignMapProps) {
  const { map, mission: missionState } = AppStateContainer.useContainer();
  const { mission } = missionState;
  const { mapType, showLegend } = map;
  const mapContext = React.useContext(MapContext);

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
      <LegendContext.Provider value={{ legends: [] }}>
        {position && <MapContextMenu position={position} />}
        <Map
          ref={ref => {
            const map = ref ? (ref.contextValue ? ref.contextValue.map : null) : null;
            mapContext.map = map;
          }}
          center={pick(props, ['lat', 'lng'])}
          zoom={props.zoom}
          preferCanvas={true}
          onclick={props.onMapClick}
          oncontextmenu={onContextMenuClick}
        >
          <TileLayer
            url={`https://api.mapbox.com/styles/v1/${mapType}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY2hpbnBvayIsImEiOiJjamxnYmtubDIxNXkxM3FtaWR2dThvZTU3In0.EQeuA12Ganj2LkQ8VRn3lA`}
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
        {showLegend && <Legend />}
      </LegendContext.Provider>
    </div>
  );
}
