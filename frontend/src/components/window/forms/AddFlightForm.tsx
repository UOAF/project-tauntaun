import '../Window.css';

import React, { useState } from 'react';

import { LatLng } from 'leaflet';
import { MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { AppStateContainer, MissionStateContainer, SessionStateContainer } from '../../../models';
import { gameService } from '../../../services';

export function AddFlightForm() {
  const { location, setShowAddFlightForm } = AppStateContainer.useContainer();
  const { mission } = MissionStateContainer.useContainer();
  const { sessionId, sessions } = SessionStateContainer.useContainer();
  const sessionData = sessions[sessionId];
  const sessionCoalition = sessionData ? sessionData.coalition : '';

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedAirport, setSelectedAirport] = useState(NaN);
  const [selectedPlane, setSelectedPlane] = useState('');
  const [selectedNumber, setSelectedNumber] = useState(2);

  const coalition = mission.coalition[sessionCoalition];
  const countryOptions = coalition
    ? Object.keys(coalition.countries).map(countryName => ({ value: countryName, label: countryName }))
    : [];

  // TODO coalition check missing, should show neutral and friendly airbases
  const airports = mission.terrain.airports;
  const airportsOptions = Object.keys(airports).map(key => {
    return { value: airports[key].id, label: key };
  });

  const country = coalition && selectedCountry ? coalition.countries[selectedCountry] : undefined;
  const planeOptions = country ? country.planes.map(plane => ({ value: plane.id, label: plane.id })) : [];

  const onNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedNumber(+event.target.value);
  };

  const validateInput = () => {
    if (location === undefined) return false;
    if (!selectedCountry) return false;
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

    gameService.sendAddFlight(
      sessionCoalition,
      selectedCountry,
      location as LatLng,
      selectedAirport,
      selectedPlane,
      selectedNumber
    );
    setShowAddFlightForm(false);
  };

  const onAirportChange = (event: SelectChangeEvent) => setSelectedAirport(+event.target.value);
  const onCountryChange = (event: SelectChangeEvent) => setSelectedCountry(event.target.value);
  const onPlaneChange = (event: SelectChangeEvent) => setSelectedPlane(event.target.value);
  const closeOnClick = () => setShowAddFlightForm(false);

  return (
    <div className="Popup">
      <p>Country</p>
      <Select onChange={onCountryChange}>
        {countryOptions.map((option, i) => (
          <MenuItem key={`countryOptions${i}`} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      <p>Airport</p>
      <Select onChange={onAirportChange}>
        {airportsOptions.map((option, i) => (
          <MenuItem key={`airportsOptions${i}`} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      <p>Plane</p>
      <Select onChange={onPlaneChange}>
        {planeOptions.map((option, i) => (
          <MenuItem key={`planeOptions${i}`} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      <p>
        Number
        <input type="text" pattern="[1-4]" defaultValue="2" onChange={onNumberChange} />
      </p>
      <p>
        <button onClick={addFlightOnClick}>Add flight</button>
        <button onClick={closeOnClick}>Close</button>
      </p>
    </div>
  );
}
