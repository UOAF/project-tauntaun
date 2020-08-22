import React from 'react';
import { gameService } from '../services';
import { AppStateContainer, defaultEditGroupMode, defaultAddFlightMode } from '../models';
import { EditGroupMode } from '../models/modes';
import { findGroupById } from '../models/dcs_util';
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
      const selectedGroupId = editGroupMode.selectedGroupId;
      const group = selectedGroupId ? findGroupById(appState.mission, selectedGroupId) : undefined;
      if (group) {
        appState.selectUnit(editGroupMode.selectedUnitId ? undefined : group.units[0]);
      }
    }
  };

  const onShowUnitsChange = (event: any) => {
    appState.setShowUnits(event.target.checked);
  };

  const onShowThreatRingsChange = (event: any) => {
    appState.setShowThreatRings(event.target.checked);
  };

  return (
    <div className="Menubar">
      {appState.masterMode?.name}
      <button onClick={loadOnClick}>Load mission</button>
      <button onClick={saveOnClick}>Save mission</button>
      <button onClick={addFlightOnClick}>Add flight</button>
      <button onClick={editGroupOnClick}>Edit group</button>
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
    </div>
  );
}
