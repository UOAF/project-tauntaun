import React from 'react';
import { Map, TileLayer } from 'react-leaflet';
import { pick, without } from 'lodash';

import { UnitMarker, UnitRoute } from './';
import { Unit, AppStateContainer } from '../models';

export interface CampaignMapProps {
  tileLayerUrl: string;
  lat: number;
  lng: number;
  zoom: number;
  units: Unit[];
}

export function CampaignMap(props: CampaignMapProps) {
  const appState = AppStateContainer.useContainer();

  const isUnderway = (unit: Unit): boolean => {
    return unit.points[0].action === 'Turning Point';
  };

  const { units } = props;
  const toggleUnitSelection = (unit: Unit): void => {
    console.info(`selecting unit`, unit);

    without(units, unit).forEach(unit => (unit.isSelected = false));
    unit.isSelected = !unit.isSelected;

    appState.updateUnit(unit);
  };

  const selectedUnit = units.find(unit => unit.isSelected);
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
        {units
          .filter(unit => isUnderway(unit))
          .map(unit => (
            <UnitMarker key={unit.uniqueId} unit={unit} toggleUnitSelection={toggleUnitSelection} />
          ))}
        {selectedUnit && <UnitRoute unit={selectedUnit} />}
      </Map>
    </div>
  );
}
