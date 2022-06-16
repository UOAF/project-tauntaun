import './MenuBar.css';

import React from 'react';
import { AppStateContainer, MapStateContainer } from '../../models';
import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';

import { SelectOptionType } from '../../types/material_ui';
import { ModeContext } from '../contexts';
import { Foldable } from '../ui/Foldable';
import { Basemaps } from 'esri-leaflet';

export function UserMenuBar() {
  const { commanderMode, showRoleSelectionForm, setShowLoadoutEditor, setShowRoleSelectionForm, setShowRoleOverview } =
    AppStateContainer.useContainer();

  const {
    showUnits,
    showThreatRings,
    showFriendlyThreatRings,
    showRadarRings,
    showFriendlyRadarRings,
    showOtherFlightPlans,
    showOtherWpNames,
    showAIFlightPlans,
    showLegend,
    hideAllHostileUnits,
    mapType,
    showRuler,
    setShowUnits,
    setShowAIFlightPlans,
    setShowThreatRings,
    setShowFriendlyThreatRings,
    setShowRadarRings,
    setShowFriendlyRadarRings,
    setShowOtherFlightPlans,
    setShowOtherWpNames,
    setShowLegend,
    setMapType,
    setHideAllHostileUnits,
    setShowRuler
  } = MapStateContainer.useContainer();

  const { selectedUnitId } = React.useContext(ModeContext);

  const showEditLoadoutButton = commanderMode || selectedUnitId;

  const mapTypes = [
    { value: 'Topographic', label: 'Topograhpic' },
    { value: 'Streets', label: 'Streets' },
    { value: 'Imagery', label: 'Satellite' },
    { value: 'Gray', label: 'Light' },
    { value: 'DarkGray', label: 'Dark' }
  ];

  const editLoadoutOnClick = () => {
    if (selectedUnitId) {
      setShowLoadoutEditor(true);
    }
  };
  type ChangeEvent = React.ChangeEvent<HTMLInputElement>;

  const onShowUnitsChange = (event: ChangeEvent) => setShowUnits(event.target.checked);
  const onShowThreatRingsChange = (event: ChangeEvent) => setShowThreatRings(event.target.checked);
  const onShowFriendlyThreatRingsChange = (event: ChangeEvent) => setShowFriendlyThreatRings(event.target.checked);
  const onShowRadarRingsChange = (event: ChangeEvent) => setShowRadarRings(event.target.checked);
  const onShowFriendlyRadarRingsChange = (event: ChangeEvent) => setShowFriendlyRadarRings(event.target.checked);
  const onShowOtherFlightPlansChange = (event: ChangeEvent) => setShowOtherFlightPlans(event.target.checked);
  const onShowOtherWpNamesChange = (event: ChangeEvent) => setShowOtherWpNames(event.target.checked);
  const onShowAIFlightPlansChange = (event: ChangeEvent) => setShowAIFlightPlans(event.target.checked);
  const onShowLegendChange = (event: ChangeEvent) => setShowLegend(event.target.checked);
  const unitSelectionOnClick = () => setShowRoleSelectionForm(!showRoleSelectionForm);
  const onHideAllHostileUnitsChange = (event: ChangeEvent) => setHideAllHostileUnits(event.target.checked);
  const onShowRulerChange = (event: ChangeEvent) => setShowRuler(event.target.checked);

  const onMapTypeSelected = (event: SelectChangeEvent) => {
    const value = event.target.value;

    setMapType(value as Basemaps);
  };

  return (
    <React.Fragment>
      {<button onClick={() => setShowRoleOverview(true)}>Role overview</button>}
      {!commanderMode && <button onClick={unitSelectionOnClick}>Role selection</button>}
      {showEditLoadoutButton && <button onClick={editLoadoutOnClick}>Edit loadout</button>}
      <div>
        <Foldable text="Markers">
          <FormControlLabel
            value="start"
            control={<Checkbox checked={showUnits} color="primary" onChange={onShowUnitsChange} />}
            label="Units"
            labelPlacement="end"
          />
          <FormControlLabel
            value="start"
            control={<Checkbox checked={showThreatRings} color="primary" onChange={onShowThreatRingsChange} />}
            label="Threat rings"
            labelPlacement="end"
          />
          <FormControlLabel
            value="start"
            control={
              <Checkbox checked={showFriendlyThreatRings} color="primary" onChange={onShowFriendlyThreatRingsChange} />
            }
            label="Friendly threat rings"
            labelPlacement="end"
          />
          <FormControlLabel
            value="start"
            control={<Checkbox checked={showRadarRings} color="primary" onChange={onShowRadarRingsChange} />}
            label="Radar rings"
            labelPlacement="end"
          />
          <FormControlLabel
            value="start"
            control={
              <Checkbox checked={showFriendlyRadarRings} color="primary" onChange={onShowFriendlyRadarRingsChange} />
            }
            label="Friendly radar rings"
            labelPlacement="end"
          />
          <FormControlLabel
            value="start"
            control={<Checkbox checked={hideAllHostileUnits} color="primary" onChange={onHideAllHostileUnitsChange} />}
            label="Hide enemy units"
            labelPlacement="end"
          />
        </Foldable>
      </div>
      <div>
        <Foldable text="Flightplan">
          <FormControlLabel
            value="start"
            control={<Checkbox checked={showAIFlightPlans} color="primary" onChange={onShowAIFlightPlansChange} />}
            label="AI flightplans"
            labelPlacement="end"
          />
          <FormControlLabel
            value="start"
            control={
              <Checkbox checked={showOtherFlightPlans} color="primary" onChange={onShowOtherFlightPlansChange} />
            }
            label="Other flightplans"
            labelPlacement="end"
          />
          <FormControlLabel
            value="start"
            control={<Checkbox checked={showOtherWpNames} color="primary" onChange={onShowOtherWpNamesChange} />}
            label="Other wp names"
            labelPlacement="end"
          />
        </Foldable>
      </div>
      <div>
        <FormControlLabel
          value="start"
          control={<Checkbox checked={showLegend} color="primary" onChange={onShowLegendChange} />}
          label="Show legend"
          labelPlacement="end"
        />
        <FormControl>
          <InputLabel>Map type</InputLabel>
          <Select className="MapTypeSelect" defaultValue={mapType} onChange={(event: SelectChangeEvent) => onMapTypeSelected(event)}>
            {mapTypes.map((v: SelectOptionType) => (
              <MenuItem key={`mapTypes${v.value}`} value={v.value}>
                {v.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControlLabel
          value="start"
          control={<Checkbox checked={showRuler} color="primary" onChange={onShowRulerChange} />}
          label="Show ruler"
          labelPlacement="end"
        />
      </div>
    </React.Fragment>
  );
}
