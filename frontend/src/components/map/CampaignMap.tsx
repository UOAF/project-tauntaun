import './CampaignMap.css';

import React, { useState } from 'react';
import { MapContainer } from 'react-leaflet';
import { BasemapLayer } from 'react-esri-leaflet';
import { Basemaps } from 'esri-leaflet';

import { MapStateContainer, MissionStateContainer, SessionStateContainer } from '../../models';
import { LatLng, LeafletMouseEvent } from 'leaflet';
import { ClickPosition, PointXY } from '../contextmenu';
import { LegendContext } from './contexts';
import { MapContextMenu } from './MapContextMenu';
import { AirportLayer, CoalitionLayer } from './layers';
import { Legend } from './Legend';
import { Ruler } from './layers/lines/Ruler';
import { CampaignMapEventHandler } from './CampaignMapEventHandler';

export interface CampaignMapProps {
  lat: number;
  lng: number;
  zoom: number;
  onMapClick?: (e: LeafletMouseEvent) => void;
}

export const CampaignMap = (props: CampaignMapProps): JSX.Element => {
  const { mission } = MissionStateContainer.useContainer();
  const { mapType, showLegend, showRuler } = MapStateContainer.useContainer();

  const { sessionId, sessions } = SessionStateContainer.useContainer();
  const sessionData = sessions[sessionId];
  const sessionCoalition = sessionData ? sessionData.coalition : '';

  const [position, setPosition] = useState(null as ClickPosition | null);
  const center = new LatLng(props.lat, props.lng);

  const onContextMenuClick = (event: LeafletMouseEvent) => {
    event.originalEvent.preventDefault();
    setPosition({
      xy: {
        x: event.originalEvent.clientX,
        y: event.originalEvent.clientY
      } as PointXY,
      latlon: event.latlng
    } as ClickPosition);
  };

  // Need to add a second layer with labels for these three basemaps.
  const layersNeedingLabels = ['Imagery', 'Gray', 'DarkGray'];
  const showLabels = layersNeedingLabels.includes(mapType);
  const labelLayerName = (mapType + 'Labels') as Basemaps;

  return (
    <div data-testid="campaign-map">
      <LegendContext.Provider value={{ legends: [] }}>
        <MapContainer
          center={center}
          zoom={props.zoom}
          preferCanvas={true}
          doubleClickZoom={false}
          inertia={false}
          zoomControl={false}
        >
          <BasemapLayer key={mapType} name={mapType} />
          {showLabels && <BasemapLayer key={labelLayerName} name={labelLayerName} />}
          <CampaignMapEventHandler
            eventHandlers={{
              contextmenu: onContextMenuClick
            }}
          />
          {sessionCoalition && (
            <React.Fragment>
              <AirportLayer airports={mission.terrain.airports} />
              {Object.keys(mission.coalition).map(key => (
                <CoalitionLayer key={key} coalition={mission.coalition[key]} />
              ))}
            </React.Fragment>
          )}
          {position && <MapContextMenu position={position} />}
          {showRuler && <Ruler />}
        </MapContainer>
        {showLegend && <Legend />}
      </LegendContext.Provider>
    </div>
  );
};
