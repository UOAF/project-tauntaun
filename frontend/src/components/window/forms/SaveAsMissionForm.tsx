import { Input } from '@material-ui/core';
import React, { useState } from 'react';
import { AppStateContainer } from '../../../models/appState';
import { gameService } from '../../../services/gameService';

export function SaveAsMissionForm() {
  const { setShowSaveAsMissionForm } = AppStateContainer.useContainer();
  const [filename, setFilename] = useState('');

  const onSaveClick = () => {
    gameService.sendSaveMission(filename);
    console.log(`Saving mission ${filename}`);
    setShowSaveAsMissionForm(false);
  };

  return (
    <div className="PopupBig">
      <span>Filename:</span>
      <Input onChange={e => setFilename(e.target.value)}></Input>
      <button onClick={onSaveClick}>Save</button>
      <button onClick={() => setShowSaveAsMissionForm(false)}>Close</button>
    </div>
  );
}
