import './MissionTime.css';

import React from 'react';
import { AppStateContainer } from '../../models';

export function MissionTime() {
  const { mission: missionState } = AppStateContainer.useContainer();
  const { start_time } = missionState.mission;

  return (
    <div className="MissionTime">
      <span>{start_time}</span>
    </div>
  );
}
