import React from "react";
import { gameService } from "../services";
import { AppStateContainer, defaultEditGroupMode, defaultAddFlightMode } from "../models";

export function MenuBar() {
  const appState = AppStateContainer.useContainer();

  const saveOnClick = () => {
    console.log("Saving mission.");
    gameService.sendSaveMission();
  }

  const addFlightOnClick = () => {
    appState.setMasterMode(defaultAddFlightMode);
  }

  const editGroupOnClick = () => {
    appState.setMasterMode(defaultEditGroupMode);
  }

  return (    
    <div>
      {appState.masterMode?.name}
      <button onClick={saveOnClick}>
        Save mission
    </button>
      <button onClick={addFlightOnClick}>
        Add flight
    </button>
      <button onClick={editGroupOnClick}>
        Edit group
    </button>
    </div>
  );
};
