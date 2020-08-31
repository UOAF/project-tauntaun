import React, { useState } from 'react';
import Select from 'react-select';
import { Group, AppStateContainer, PointAction } from '../models';
import { gameService } from '../services';
import { SelectOptionType } from '../types/material_ui';

export interface EditWaypointFormProps {
  group: Group;
  pointIndex: number;
}

export function EditWaypointForm(props: EditWaypointFormProps) {
  const appState = AppStateContainer.useContainer();

  const { group, pointIndex } = props;
  const point = group.points[pointIndex];

  const [alt, setAlt] = useState(point.alt);
  const [type, setType] = useState(point.type);
  const [name, setName] = useState(point.name);
  const [speed, setSpeed] = useState(point.speed);
  const [action, setAction] = useState(point.action);

  const actionsOptions = Object.keys(PointAction).map((key, value) => {
    return { value: key, label: Object.values(PointAction)[value] };
  });

  const saveWaypointOnClick = () => {
    // TODO validate
    gameService.sendRouteModify(group, point.position, {
      ...point,
      alt: alt,
      type: type,
      name: name,
      speed: speed,
      action: action
    });

    appState.selectWaypoint(undefined);
  };

  const onActionChange = (v: SelectOptionType) => {
    setType(PointAction[v.value]);
    setAction(v.value);
  };

  const closeOnClick = () => {
    appState.selectWaypoint(undefined);
  };

  return (
    <div className="Popup">
      <p>Group name: {group.name}</p>
      <p>Waypoint number: {pointIndex}</p>
      <p>
        Alt:{' '}
        <input
          type="text"
          pattern="[0-100000]"
          defaultValue={alt}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setAlt(+event.target.value);
          }}
        />
      </p>
      <p>Type: {type}</p>
      <p>
        Name:{' '}
        <input
          type="text"
          defaultValue={name}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setName(event.target.value);
          }}
        />
      </p>
      <p>
        Speed:
        <input
          type="text"
          pattern="[0-2]{0,1}[0-9]{1,3}[\.,][0-9]+"
          defaultValue={speed}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setSpeed(+event.target.value);
          }}
        />
      </p>
      <p>
        Action: <Select options={actionsOptions} onChange={onActionChange} defaultInputValue={PointAction[action]} />
      </p>
      <p>
        <button onClick={saveWaypointOnClick}>Save waypoint</button>
        <button onClick={closeOnClick}>Close</button>
      </p>
    </div>
  );
}
