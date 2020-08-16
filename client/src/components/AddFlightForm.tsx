import React, { useState } from 'react';
import Select from 'react-select';

import { LatLng } from 'leaflet';
import { AppStateContainer } from '../models';
import { gameService } from '../services';
import { SelectOptionType } from '../types/material_ui';

export interface AddFlightFormProps {
  location: LatLng;
}

export function AddFlightForm(props: AddFlightFormProps) {
  const appState = AppStateContainer.useContainer();

  const { location } = props;

  const [selectedAirport, setSelectedAirport] = useState(NaN);
  const [selectedPlane, setSelectedPlane] = useState('');
  const [selectedNumber, setSelectedNumber] = useState(2);

  const airports = appState.mission.terrain.airports;
  const airportsOptions = Object.keys(airports).map((key, value) => {
    return { value: airports[key].id, label: key };
  });

  const coalition = appState.mission.coalition['blue'];
  const planeOptions = coalition
    ? coalition.countries['USA'].planes.map(plane => {
        return { value: plane.id, label: plane.id };
      })
    : [];

  const onNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedNumber(+event.target.value);
  };

  const validateInput = () => {
    // TODO proper validation
    if (location === undefined) return false;
    if (Number.isNaN(selectedAirport) || selectedAirport === -1) return false;
    if (selectedPlane === '') return false;
    if (Number.isNaN(selectedNumber) || selectedNumber < 1 || selectedNumber > 4) return false;

    return true;
  };

  const addFlightOnClick = () => {
    if (!validateInput()) {
      console.error('Add flight: Invalid input!');
      return;
    }

    gameService.sendAddFlight(location as LatLng, selectedAirport, selectedPlane, selectedNumber);
    appState.setLocation(undefined);
  };

  const onAirportChange = (v: SelectOptionType) => {
    setSelectedAirport(+v.value);
  };

  const onPlaneChange = (v: SelectOptionType) => {
    setSelectedPlane(v.value);
  };

  return (
    <div className="Popup">
      <p>
        Location: {location.lat} {location.lng}
      </p>
      <p>Airport</p>
      <Select options={airportsOptions} onChange={onAirportChange} />
      <p>Plane</p>
      <Select options={planeOptions} onChange={onPlaneChange} />
      <p>
        Number
        <input type="text" pattern="[1-4]" defaultValue="2" onChange={onNumberChange} />
      </p>
      <p>
        <button onClick={addFlightOnClick}>Add flight</button>
      </p>
    </div>
  );
}
