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

  const renderAdminBar = () => {
    return (
      <div>
      {appState.masterMode?.name}
      <button onClick={loadOnClick}>Load mission</button>
      <button onClick={saveOnClick}>Save mission</button>
      <button onClick={addFlightOnClick}>Add flight</button>
      <button onClick={editGroupOnClick}>Edit group</button>
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
        control={<Checkbox checked={appState.adminMode} color="primary" onChange={onAdminModeChange} />}
        label="[Admin Mode]"
        labelPlacement="end"
      />
    </div>
  );
}
