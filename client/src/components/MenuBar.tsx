import React from 'react';
import { gameService } from '../services';
import { AppStateContainer, defaultEditGroupMode, defaultAddFlightMode } from '../models';

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

  return (
    <div className="Menubar">
      {appState.masterMode?.name}
      <button onClick={loadOnClick}>Load mission</button>
      <button onClick={saveOnClick}>Save mission</button>
      <button onClick={addFlightOnClick}>Add flight</button>
      <button onClick={editGroupOnClick}>Edit group</button>
    </div>
  );
}
