import './RoleSelectionForm.css';
import './CoalitionSelector.css';

import React, { useState } from 'react';

import { InputLabel, Select, MenuItem, List, ListItem, ListItemText } from '@material-ui/core';
import {
  AppStateContainer,
  Coalitions,
  findGroupById,
  findPilotNameForUnit,
  getGroupOfUnit,
  getGroupsWithClients,
  isSkillAI,
  MissionStateContainer,
  SessionData,
  SessionStateContainer
} from '../../../models';
import { gameService } from '../../../services';

export function RoleSelectionForm() {
  const { setShowRoleSelectionForm } = AppStateContainer.useContainer();
  const { mission } = MissionStateContainer.useContainer();
  const { sessionId, sessions } = SessionStateContainer.useContainer();

  const sessionData = sessions[sessionId];
  const sessionCoalition = sessionData.coalition;
  const selectedUnitId = sessionData.selected_unit_id;
  const showLeaveUnit = sessionData && sessionData.selected_unit_id !== -1;

  const [name, setName] = useState(sessionData ? sessionData.name : '');
  const [group, setGroup] = useState(getGroupOfUnit(mission, selectedUnitId));

  const groupsWithClients = getGroupsWithClients(mission)
    .filter(g => g.coalition === sessionCoalition)
    .map(g => g.group);

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

  const unitOptions = group
    ? group.units
        .filter(u => !isSkillAI(u.skill))
        .map(u => {
          const pilotName = findPilotNameForUnit(sessions, u.id);

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
    gameService.sendSessionDataUpdate(sessionId, {
      ...sessionData,
      selected_unit_id: -1
    } as SessionData);
  };
  const onCoalitionSelected = (coalition: Coalitions) => {
    gameService.sendSessionDataUpdate(sessionId, {
      ...sessionData,
      coalition: coalition
    });
  };

  const onClose = () => setShowRoleSelectionForm(false);

  const renderCoalitionSelector = () => (
    <section className="CoalitionSelector">
      <header>
        <h1>Welcome to project Tauntaun</h1>
        <span>Select coalition</span>
      </header>
      <div className="CSButtonContainer">
        <button className="blue" onClick={() => onCoalitionSelected(Coalitions.BLUE)}>
          Blue
        </button>
        <button className="red" onClick={() => onCoalitionSelected(Coalitions.RED)}>
          Red
        </button>
      </div>
    </section>
  );

  const renderRoleSelection = () => (
    <section className="RoleSelectionForm">
      <header>
        <h2>Role Selection</h2>
      </header>
      <div className="nameContainer">
        <div className="inputContainer">
          <span>Name</span>
          <input placeholder="Enter Your Name" type="text" value={name} onChange={onNameChange} />
        </div>
        <button onClick={onSetNameClicked}>Set name</button>
      </div>
      <div className="groupSelectContainer">
        <InputLabel id="group-select">Group</InputLabel>
        <Select onChange={onGroupChange} value={group ? group.id : ''}>
          {groupOptions.map((option, i) => (
            <MenuItem key={`groupOptions${i}`} value={option.key}>
              {option.value}
            </MenuItem>
          ))}
        </Select>
      </div>
      <div className="unitSelectContainer">
        <InputLabel id="unit-select">Unit</InputLabel>
        <List>
          {unitOptions.map(option => (
            <ListItem button key={option.key} onClick={() => onUnitSelected(option.key)}>
              <ListItemText primary={option.value} />
            </ListItem>
          ))}
        </List>
      </div>
      {showLeaveUnit && (
        <button className="bottomButton" onClick={onLeaveUnitClicked}>
          Leave unit
        </button>
      )}
      <button className="bottomButton" onClick={onClose}>
        Close
      </button>
    </section>
  );

  return <React.Fragment>{sessionCoalition ? renderRoleSelection() : renderCoalitionSelector()}</React.Fragment>;
}
