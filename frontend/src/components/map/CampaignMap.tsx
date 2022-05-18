import './CampaignMap.css';

import React, { useEffect, useRef } from 'react';
import { MapContainer } from 'react-leaflet';
import { BasemapLayer } from 'react-esri-leaflet';
import * as EL from 'esri-leaflet';

import { MapStateContainer, MissionStateContainer, SessionStateContainer } from '../../models';
import { LatLng, LeafletMouseEvent, LeafletEvent } from 'leaflet';
import { useState } from 'react';
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

export function CampaignMap(props: CampaignMapProps) {
  const { mission } = MissionStateContainer.useContainer();
  const { mapType, showLegend, showRuler } = MapStateContainer.useContainer();

  const { sessionId, sessions } = SessionStateContainer.useContainer();
  const sessionData = sessions[sessionId];
  const sessionCoalition = sessionData ? sessionData.coalition : '';

  const [position, setPosition] = useState(null as ClickPosition | null);
  const [center, setCenter] = useState(new LatLng(props.lat, props.lng));

  const [oldMapType, setOldMapType] = useState(mapType);

  const redraw = oldMapType != mapType;

  const onContextMenuClick = (event: any) => {
    event.originalEvent.preventDefault();
    setPosition({
      xy: {
        x: event.originalEvent.clientX,
        y: event.originalEvent.clientY
      } as PointXY,
      latlon: event.latlng
    } as ClickPosition);
  };

  //Workaround: React-Leaflet-Esri bug: BasemapLayer does not refresh on mapType change
  useEffect(() => {
    if (oldMapType != mapType)
    {
      setOldMapType(mapType);
    }
  }, [mapType]);  

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
          {!redraw && <BasemapLayer name={mapType} />}
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
}
