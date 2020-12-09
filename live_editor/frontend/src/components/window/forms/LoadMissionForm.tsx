import { List, ListItem, ListItemText } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { AppStateContainer } from '../../../models/appState';
import { gameService } from '../../../services/gameService';

export function LoadMissionForm() {
  const { setShowLoadMissionForm } = AppStateContainer.useContainer();
  const [missionDir, setMissionDir] = useState([] as Array<string>);

  console.log(missionDir);

  useEffect(() => {
    const init = async () => {
      try {
        const fetchedMissionDir = await gameService.getMissionDir();

        console.info('LoadMissionForm initialized successfully.');
        setMissionDir(fetchedMissionDir);
      } catch (error) {
        console.info('Failed to initialize LoadMissionForm.');
      }
    };

    init();
  }, []);

  const onClick = (index: number) => {
    gameService.sendLoadMission(missionDir[index]);
    console.log(`Loading mission ${missionDir[index]}`);
    setShowLoadMissionForm(false);
  };

  return (
    <div className="PopupBig">
      <List dense={true} style={{ height: '80vh', overflow: 'auto' }}>
        {missionDir.map((dir, index) => (
          <ListItem key={`dir-${index}`} button={true} onClick={() => onClick(index)}>
            <ListItemText primary={dir} />
          </ListItem>
        ))}
      </List>

      <button onClick={() => setShowLoadMissionForm(false)}>Close</button>
    </div>
  );
}
