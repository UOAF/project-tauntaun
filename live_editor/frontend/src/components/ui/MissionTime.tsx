import './MissionTime.css';

import React from 'react';
import { MissionStateContainer } from '../../models';

export function MissionTime() {
  const { mission } = MissionStateContainer.useContainer();
  const { start_time } = mission;

  return (
    <div className="MissionTime">
      <span>{start_time}</span>
    </div>
  );
}
