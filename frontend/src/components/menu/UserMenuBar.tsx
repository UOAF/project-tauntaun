import './MenuBar.css';

import React from 'react';
import { AppStateContainer, MapStateContainer } from '../../models';
import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select } from '@material-ui/core';

import { SelectOptionType } from '../../types/material_ui';
import { ModeContext } from '../contexts';
import { Foldable } from '../ui/Foldable';

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
    { value: 'ImageryLabels', label: 'Satellite' },
    { value: 'GrayLabels', label: 'Light' },
    { value: 'DarkGrayLabels', label: 'Dark' }
  ];

  const editLoadoutOnClick = () => {
    if (selectedUnitId) {
      setShowLoadoutEditor(true);
    }
  };

  const onShowUnitsChange = (event: any) => setShowUnits(event.target.checked);
  const onShowThreatRingsChange = (event: any) => setShowThreatRings(event.target.checked);
  const onShowFriendlyThreatRingsChange = (event: any) => setShowFriendlyThreatRings(event.target.checked);
  const onShowRadarRingsChange = (event: any) => setShowRadarRings(event.target.checked);
  const onShowFriendlyRadarRingsChange = (event: any) => setShowFriendlyRadarRings(event.target.checked);
  const onShowOtherFlightPlansChange = (event: any) => setShowOtherFlightPlans(event.target.checked);
  const onShowOtherWpNamesChange = (event: any) => setShowOtherWpNames(event.target.checked);
  const onShowAIFlightPlansChange = (event: any) => setShowAIFlightPlans(event.target.checked);
  const onShowLegendChange = (event: any) => setShowLegend(event.target.checked);
  const unitSelectionOnClick = () => setShowRoleSelectionForm(!showRoleSelectionForm);
  const onHideAllHostileUnitsChange = (event: any) => setHideAllHostileUnits(event.target.checked);
  const onShowRulerChange = (event: any) => setShowRuler(event.target.checked);

  const onMapTypeSelected = (event: any) => {
    const value = event.target.value;

    setMapType(value);
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
          <Select className="MapTypeSelect" defaultValue={mapType} onChange={(event: any) => onMapTypeSelected(event)}>
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
