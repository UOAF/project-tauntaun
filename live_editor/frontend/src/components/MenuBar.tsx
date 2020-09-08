import React from 'react';
import { gameService } from '../services';
import { AppStateContainer, defaultEditGroupMode, defaultAddFlightMode } from '../models';
import { EditGroupMode } from '../models/modes';
import { Checkbox, FormControlLabel } from '@material-ui/core';

export function MenuBar() {
  const appState = AppStateContainer.useContainer();

  const saveOnClick = () => {
    console.log('Saving mission.');
    gameService.sendSaveMission();
  };

  const loadOnClick = () => {
    console.log('Loading mission.');
    gameService.sendLoadMission();
  };

  const addFlightOnClick = () => {
    appState.setMasterMode(defaultAddFlightMode);
  };

  const editGroupOnClick = () => {
    appState.setMasterMode(defaultEditGroupMode);
  };

  const editLoadoutOnClick = () => {
    if (appState.masterMode && appState.masterMode.name === 'EditGroupMode') {
      const editGroupMode = appState.masterMode as EditGroupMode;
      const selectedUnitd = editGroupMode.selectedUnitId;
      if (selectedUnitd) {
        appState.setLoadoutEditorVisibility(true);
      }
    }
  };

  const onShowUnitsChange = (event: any) => {
    appState.setShowUnits(event.target.checked);
  };

  const onShowThreatRingsChange = (event: any) => {
    appState.setShowThreatRings(event.target.checked);
  };

  const onAdminModeChange = (event: any) => {
    appState.setAdminMode(event.target.checked);
  };

  const onShowOtherFlightPlansChange = (event: any) => {
    appState.setShowOtherFlightPlans(event.target.checked);
  };

  const onShowOtherWpNamesChange = (event: any) => {
    appState.setShowOtherWpNames(event.target.checked);
  };

  const onShowAIFlightPlansChange = (event: any) => {
    appState.setShowAIFlightPlans(event.target.checked);
  };

  const onShowAllGroupsChange = (event: any) => {
    appState.setShowAllGroups(event.target.checked);
  };

  const onShowLegendChange = (event: any) => {
    appState.setShowLegend(event.target.checked);
  };

  const renderAdminBar = () => {
    return (
      <div>
      {appState.masterMode?.name}
      <button onClick={loadOnClick}>Load mission</button>
      <button onClick={saveOnClick}>Save mission</button>
      <button onClick={addFlightOnClick}>Add flight</button>
      <button onClick={editGroupOnClick}>Edit group</button>
      <FormControlLabel
        value="start"
        control={<Checkbox checked={appState.showAllGroups} color="primary" onChange={onShowAllGroupsChange} />}
        label="Show all groups"
        labelPlacement="end"
      />      
    </div>
    );
  };

  return (
    <div className="Menubar">
      {appState.adminMode && renderAdminBar()}
      <button onClick={editLoadoutOnClick}>Edit loadout</button>
      <FormControlLabel
        value="start"
        control={<Checkbox checked={appState.showUnits} color="primary" onChange={onShowUnitsChange} />}
        label="Show units"
        labelPlacement="end"
      />
      <FormControlLabel
        value="start"
        control={<Checkbox checked={appState.showThreatRings} color="primary" onChange={onShowThreatRingsChange} />}
        label="Show threat rings"
        labelPlacement="end"
      />      
      <FormControlLabel
        value="start"
        control={<Checkbox checked={appState.showOtherFlightPlans} color="primary" onChange={onShowOtherFlightPlansChange} />}
        label="Show other flightplans"
        labelPlacement="end"
      />
      <FormControlLabel
        value="start"
        control={<Checkbox checked={appState.showOtherWpNames} color="primary" onChange={onShowOtherWpNamesChange} />}
        label="Show other wp names"
        labelPlacement="end"
      />
      <FormControlLabel
        value="start"
        control={<Checkbox checked={appState.showAIFlightPlans} color="primary" onChange={onShowAIFlightPlansChange} />}
        label="Show AI flightplans"
        labelPlacement="end"
      />
      <FormControlLabel
        value="start"
        control={<Checkbox checked={appState.showLegend} color="primary" onChange={onShowLegendChange} />}
        label="Show legend"
        labelPlacement="end"
      />      
      <FormControlLabel
        value="start"
        control={<Checkbox checked={appState.adminMode} color="primary" onChange={onAdminModeChange} />}
        label="[Admin Mode]"
        labelPlacement="end"
      />
    </div>
  );
}
