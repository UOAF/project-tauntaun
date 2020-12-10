import React from 'react';
import { gameService } from '../../services';
import { AppStateContainer, MapStateContainer } from '../../models';
import { Checkbox, FormControlLabel } from '@material-ui/core';

export function AdminMenuBar() {
  const {
    commanderMode,
    setCommanderMode,
    setShowLoadMissionForm,
    setShowSaveAsMissionForm
  } = AppStateContainer.useContainer();
  const { showAllGroups, setShowAllGroups } = MapStateContainer.useContainer();

  const saveOnClick = () => {
    console.log('Saving mission.');
    gameService.sendSaveMission();
  };

  const loadOnClick = () => {
    setShowLoadMissionForm(true);
  };

  const onShowAllGroupsChange = (event: any) => setShowAllGroups(event.target.checked);
  const onCommanderModeChange = (event: any) => setCommanderMode(event.target.checked);

  return (
    <React.Fragment>
      <button onClick={loadOnClick}>Load</button>
      <button onClick={saveOnClick}>Save</button>
      <button onClick={() => setShowSaveAsMissionForm(true)}>Save as</button>
      <FormControlLabel
        value="start"
        control={<Checkbox checked={showAllGroups} color="primary" onChange={onShowAllGroupsChange} />}
        label="Show all groups"
        labelPlacement="end"
      />
      <FormControlLabel
        value="start"
        control={<Checkbox checked={commanderMode} color="secondary" onChange={onCommanderModeChange} />}
        label="Commander Mode"
        labelPlacement="end"
      />
    </React.Fragment>
  );
}
