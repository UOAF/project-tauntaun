import './Window.css';
import './RoleOverview.css';

import React from 'react';
import {
  AppStateContainer,
  findPilotNameForUnit,
  getGroupsWithClients,
  MissionStateContainer,
  SessionStateContainer
} from '../../models';
import { max } from 'lodash';
export function RoleOverview() {
  const { setShowRoleOverview } = AppStateContainer.useContainer();
  const { sessionId, sessions } = SessionStateContainer.useContainer();
  const { mission } = MissionStateContainer.useContainer();

  const sessionData = sessions[sessionId];
  const sessionCoalition = sessionData ? sessionData.coalition : '';
  const groupsWithClients = getGroupsWithClients(mission)
    .filter(g => g.coalition === sessionCoalition)
    .map(g => g.group);
  const numberOfUnitsPerGroup = groupsWithClients.map(g => g.units.length);
  const totalNumberOfSlots = numberOfUnitsPerGroup.reduce((pv, cv) => pv + cv, 0);
  const maxNumberOfUnitsPerGroup = max(numberOfUnitsPerGroup);
  const totalNumberOfOccupiedUnits = groupsWithClients
    .map(group =>
      group.units.map(unit => findPilotNameForUnit(sessions, unit.id)).reduce((pv, cv) => (cv ? pv + 1 : pv), 0)
    )
    .reduce((pv, cv) => pv + cv, 0);

  const rows = groupsWithClients.map((group, index) => {
    const unitNames = group.units.map(unit => findPilotNameForUnit(sessions, unit.id));
    const unitsOccupied = unitNames.reduce((pv, cv) => (cv ? pv + 1 : pv), 0);

    return (
      <tr key={`row_${group.name}_${index}`}>
        <th>{group.name}</th>
        <th>{group.units[0].type}</th>
        <th>{`${unitsOccupied}/${group.units.length}`}</th>
        {unitNames.map((unitName, index) => (
          <th key={index}>{unitName}</th>
        ))}
      </tr>
    );
  });

  return (
    <div className="PopupBig">
      <div>
        <h1>{`Total ${totalNumberOfOccupiedUnits}/${totalNumberOfSlots}`}</h1>
      </div>
      <table className="minimalistBlack">
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Total</th>
          {[...Array(maxNumberOfUnitsPerGroup).keys()].map(i => (
            <th key={i}>{i + 1}</th>
          ))}
        </tr>
        {rows}
      </table>

      <div className="CloseButton">
        <button onClick={() => setShowRoleOverview(false)}>Close</button>
      </div>
    </div>
  );
}
