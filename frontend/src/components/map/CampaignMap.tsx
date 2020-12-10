import './CampaignMap.css';

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, MapConsumer } from 'react-leaflet';

import { MapStateContainer, MissionStateContainer, SessionStateContainer } from '../../models';
import { LatLng, LeafletMouseEvent } from 'leaflet';
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
  const { mapType, showLegend, mapToken, showRuler } = MapStateContainer.useContainer();

  const { sessionId, sessions } = SessionStateContainer.useContainer();
  const sessionData = sessions[sessionId];
  const sessionCoalition = sessionData ? sessionData.coalition : '';

  const [position, setPosition] = useState(null as ClickPosition | null);
  const [center, setCenter] = useState(new LatLng(props.lat, props.lng));

  const tileUrl = `https://api.mapbox.com/styles/v1/${mapType}/tiles/{z}/{x}/{y}?access_token=${mapToken}`;
  const tileLayerRef = useRef(null);

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

  // Workaround: React-Leaflet bug: TileLayer does not refresh on url change
  useEffect(() => {
    const tileLayer = tileLayerRef.current;
    if (tileLayer !== null) {
      (tileLayer as any).setUrl(tileUrl);
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
          <CampaignMapEventHandler
            eventHandlers={{
              contextmenu: onContextMenuClick
            }}
          />
          <MapConsumer>
            {map => {
              const newCenter = new LatLng(props.lat, props.lng);
              if (center.lat !== newCenter.lat && center.lng !== newCenter.lng) {
                map.setView(newCenter, props.zoom);
                setCenter(newCenter);
              }
              return null;
            }}
          </MapConsumer>
          <TileLayer
            ref={tileLayerRef}
            url={tileUrl}
            maxZoom={20}
            attribution={
              'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
              '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
              'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
            }
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
