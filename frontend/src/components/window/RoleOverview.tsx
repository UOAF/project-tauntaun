import './RoleOverview.css';

import React from 'react';
import {
  AppStateContainer,
  findPilotNameForUnit,
  getGroupsWithClients,
  MissionStateContainer,
  SessionStateContainer
} from '../../models';
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

  const totalNumberOfOccupiedUnits = groupsWithClients
    .map(group =>
      group.units.map(unit => findPilotNameForUnit(sessions, unit.id)).reduce((pv, cv) => (cv ? pv + 1 : pv), 0)
    )
    .reduce((pv, cv) => pv + cv, 0);

  const singleFlight = groupsWithClients.map((group, index) => {
    const unitNames = group.units.map(unit => findPilotNameForUnit(sessions, unit.id));
    const unitsOccupied = unitNames.reduce((pv, cv) => (cv ? pv + 1 : pv), 0);

    return (
      <div key={`row_${group.name}_${index}`} className="singleFlight">
        <span>{group.name}</span>
        <span>{group.units[0].type}</span>
        <span>{`${unitsOccupied}/${group.units.length}`}</span>
        {unitNames.map((unitName, index) => (
          <span key={index} className={unitName ? '' : 'vacantSlot'}>
            {unitName ? unitName : 'Vacant'}
          </span>
        ))}
      </div>
    );
  });

  return (
    <section className="RoleOverviewContainer">
      <div className="RoleOverviewHeader">
        <h1>Role Overview</h1>
        <span>{`Total ${totalNumberOfOccupiedUnits}/${totalNumberOfSlots}`}</span>
        <button onClick={() => setShowRoleOverview(false)} className="CloseButton">
          Close
        </button>
      </div>
      <div className="ROTable">
        <div className="ROTHeader">
          <div>Name</div>
          <div>Type</div>
          <div>Total</div>
          <div>1</div>
          <div>2</div>
          <div>3</div>
          <div>4</div>
        </div>
        <div className="flightContainer">{singleFlight}</div>
      </div>
    </section>
  );
}
