import React from 'react';
import { gameService } from '../../services';
import { AppStateContainer } from '../../models';
import { Checkbox, FormControlLabel } from '@material-ui/core';

export function AdminMenuBar() {
  const { map } = AppStateContainer.useContainer();
  const { showAllGroups, setShowAllGroups } = map;

  const saveOnClick = () => {
    console.log('Saving mission.');
    gameService.sendSaveMission();
  };

  const loadOnClick = () => {
    console.log('Loading mission.');
    gameService.sendLoadMission();
  };

  const onShowAllGroupsChange = (event: any) => setShowAllGroups(event.target.checked);

  return (
    <React.Fragment>
      <button onClick={loadOnClick}>Load mission</button>
      <button onClick={saveOnClick}>Save mission</button>
      <FormControlLabel
        value="start"
        control={<Checkbox checked={showAllGroups} color="primary" onChange={onShowAllGroupsChange} />}
        label="Show all groups"
        labelPlacement="end"
      />
    </React.Fragment>
  );
}
