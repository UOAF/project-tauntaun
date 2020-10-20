import './MenuBar.css';

import React from 'react';
import { AppStateContainer } from '../../models';
import { Checkbox, FormControlLabel, MenuItem, Select } from '@material-ui/core';

import { SelectOptionType } from '../../types/material_ui';
import { ModeContext } from '../contexts';
import { Foldable } from '../ui/Foldable';

export function UserMenuBar() {
  const {
    map,
    commanderMode,
    showBriefingForm,
    setShowLoadoutEditor,
    setShowBriefingForm
  } = AppStateContainer.useContainer();

  const {
    showUnits,
    showThreatRings,
    showOtherFlightPlans,
    showOtherWpNames,
    showAIFlightPlans,
    showLegend,
    hideAllHostileUnits,
    mapType,
    setShowUnits,
    setShowAIFlightPlans,
    setShowThreatRings,
    setShowOtherFlightPlans,
    setShowOtherWpNames,
    setShowLegend,
    setMapType,
    setHideAllHostileUnits
  } = map;

  const { selectedUnitId } = React.useContext(ModeContext);

  const showEditLoadoutButton = commanderMode || selectedUnitId;

  const mapTypes = [
    { value: 'mapbox/outdoors-v11', label: 'Outdoors' },
    { value: 'mapbox/streets-v11', label: 'Streets' },
    { value: 'mapbox/satellite-streets-v11', label: 'Satellite' },
    { value: 'mapbox/light-v10', label: 'Light' },
    { value: 'mapbox/dark-v10', label: 'Dark' }
  ];

  const editLoadoutOnClick = () => {
    if (selectedUnitId) {
      setShowLoadoutEditor(true);
    }
  };

  const onShowUnitsChange = (event: any) => setShowUnits(event.target.checked);
  const onShowThreatRingsChange = (event: any) => setShowThreatRings(event.target.checked);
  const onShowOtherFlightPlansChange = (event: any) => setShowOtherFlightPlans(event.target.checked);
  const onShowOtherWpNamesChange = (event: any) => setShowOtherWpNames(event.target.checked);
  const onShowAIFlightPlansChange = (event: any) => setShowAIFlightPlans(event.target.checked);
  const onShowLegendChange = (event: any) => setShowLegend(event.target.checked);
  const unitSelectionOnClick = () => setShowBriefingForm(!showBriefingForm);
  const onHideAllHostileUnitsChange = (event: any) => setHideAllHostileUnits(event.target.checked);

  const onMapTypeSelected = (event: any) => {
    const value = event.target.value;

    setMapType(value);
  };

  return (
    <React.Fragment>
      {!commanderMode && <button onClick={unitSelectionOnClick}>Unit selection</button>}
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
        Map Type
        <Select className="MapTypeSelect" defaultValue={mapType} onChange={(event: any) => onMapTypeSelected(event)}>
          {mapTypes.map((v: SelectOptionType) => (
            <MenuItem key={`mapTypes${v.value}`} value={v.value}>
              {v.label}
            </MenuItem>
          ))}
        </Select>
      </div>
    </React.Fragment>
  );
}
