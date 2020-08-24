import React, { useState } from 'react';

import { gameService } from '../services';
import { SessionData } from '../models/sessionData';
import { InputLabel, Select, MenuItem, List, ListItem, ListItemText } from '@material-ui/core';
import { AppStateContainer } from '../models/appState';
import { getGroups, findGroupById } from '../models/dcs_util';
import wu from 'wu';
import { find } from 'lodash';
import { SessionContext } from './App';

export function BriefingForm() {
  const appState = AppStateContainer.useContainer();

  const { mission } = appState;

  const { sessionId, sessions } = React.useContext(SessionContext);

  const sessionData = sessions[sessionId];

  const [name, setName] = useState(sessionData ? sessionData.name : '');
  const [groupId, setGroupId] = useState(-1);

  const group = groupId ? findGroupById(mission, groupId) : undefined;

  const onSetNameClicked = () => {
    if (name.length === 0) return;

    gameService.sendSessionDataUpdate(sessionId, {
      ...sessionData,
      name: name
    });
  };

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const groupsWithClients = wu(getGroups(mission))
    .filter(g => g.units.find(u => u.skill === 'Skill.Client') !== undefined)
    .toArray();

  const groupOptions = groupsWithClients.map(g => {
    return {
      key: g.id,
      value: `${g.name} - ${g.units[0].type} - ${g.task}`
    };
  });

  const onGroupChange = (event: any) => {
    const groupId = +event.target.value;
    setGroupId(groupId);
    appState.selectGroup(groupId);
  };

  const findPilotNameForUnit = (id: number) => {
    const session = find(sessions, s => s.selected_unit_id === id);
    if (session) return session.name;
    return undefined;
  };

  const unitOptions = group
    ? group.units
        .filter(u => u.skill === 'Skill.Client')
        .map(u => {
          const pilotName = findPilotNameForUnit(u.id);

          return {
            key: u.id,
            value: pilotName ? `${u.name} - [${pilotName}]` : u.name
          };
        })
    : [];

  const onUnitSelected = (unitId: number) => {
    gameService.sendSessionDataUpdate(sessionId, {
      ...sessionData,
      selected_unit_id: unitId
    } as SessionData);
  };

  const onGetOutClicked = () => {
    gameService.sendSessionDataUpdate(sessionId, {
      ...sessionData,
      selected_unit_id: -1
    } as SessionData);
  };

  return (
    <div className="Panel">
      <p>
        Name
        <input type="text" value={name} onChange={onNameChange} />
        <button onClick={onSetNameClicked}>Set name</button>
      </p>
      <div>
        <InputLabel id="group-select">Group</InputLabel>
        <Select labelId="group-select" id="group-select" onChange={onGroupChange}>
          {groupOptions.map(option => (
            <MenuItem value={option.key}>{option.value}</MenuItem>
          ))}
        </Select>
      </div>
      <div>
        <InputLabel id="unit-select">Unit</InputLabel>
        <List>
          {unitOptions.map(option => (
            <ListItem button key={option.key} onClick={() => onUnitSelected(option.key)}>
              <ListItemText primary={option.value} />
            </ListItem>
          ))}
        </List>
      </div>
      {sessionData && sessionData.selected_unit_id !== -1 && <button onClick={onGetOutClicked}>Leave unit</button>}
    </div>
  );
}
