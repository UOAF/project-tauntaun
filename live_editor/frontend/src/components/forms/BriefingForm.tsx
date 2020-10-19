import './Forms.css';

import React, { useState } from 'react';

import { InputLabel, Select, MenuItem, List, ListItem, ListItemText } from '@material-ui/core';
import wu from 'wu';
import { find } from 'lodash';
import { AppStateContainer, findGroupById, getGroupOfUnit, getGroups, SessionData, Skill } from '../../models';
import { gameService } from '../../services';

export function BriefingForm() {
  const { session: sessionState, mission: missionState, setShowBriefingForm } = AppStateContainer.useContainer();
  const { mission } = missionState;
  const { sessionId, sessions } = sessionState;

  const sessionData = sessions[sessionId];
  const selectedUnitId = sessionData.selected_unit_id;
  const showLeaveUnit = sessionData && sessionData.selected_unit_id !== -1;

  const [name, setName] = useState(sessionData ? sessionData.name : '');
  const [group, setGroup] = useState(getGroupOfUnit(mission, selectedUnitId));

  const groupsWithClients = wu(getGroups(mission))
    .filter(g => g.units.find(u => u.skill === Skill.Client) !== undefined)
    .toArray();

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

  const groupOptions = groupsWithClients.map(g => {
    return {
      key: g.id,
      value: `${g.name} - ${g.units[0].type} - ${g.task}`
    };
  });

  const onGroupChange = (event: any) => {
    const groupId = +event.target.value;
    setGroup(groupId !== -1 ? findGroupById(mission, groupId) : undefined);
  };

  const findPilotNameForUnit = (id: number) => {
    const session = find(sessions, s => s.selected_unit_id === id);
    return session?.name;
  };

  const unitOptions = group
    ? group.units
        .filter(u => u.skill === Skill.Client)
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

  const onLeaveUnitClicked = () => {
    console.log(sessionId, selectedUnitId);
    gameService.sendSessionDataUpdate(sessionId, {
      ...sessionData,
      selected_unit_id: -1
    } as SessionData);
  };

  const onClose = () => setShowBriefingForm(false);

  return (
    <div className="PopupBig">
      <p>
        Name
        <input type="text" value={name} onChange={onNameChange} />
        <button onClick={onSetNameClicked}>Set name</button>
      </p>
      <div>
        <InputLabel id="group-select">Group</InputLabel>
        <Select onChange={onGroupChange} value={group?.id}>
          {groupOptions.map((option, i) => (
            <MenuItem key={`groupOptions${i}`} value={option.key}>
              {option.value}
            </MenuItem>
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
      {showLeaveUnit && <button onClick={onLeaveUnitClicked}>Leave unit</button>}
      <button onClick={onClose}>Close</button>
    </div>
  );
}
