import '../Window.css';

import React, { useState } from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { MenuItem, Select } from '@material-ui/core';
import { AltType, AppStateContainer, Group, MovingPoint, PointAction } from '../../../models';
import { gameService } from '../../../services';
import { c_MeterToFeet } from '../../../data/constants';

export interface EditWaypointFormProps {
  group: Group;
  pointIndex: number;
}

export function EditWaypointForm(props: EditWaypointFormProps) {
  const { selection } = AppStateContainer.useContainer();
  const { selectWaypoint } = selection;

  const { group, pointIndex } = props;
  const point = group.points[pointIndex];
  const movingPoint = point as MovingPoint;

  const [alt, setAlt] = useState(point.alt);
  const [altType, setAltType] = useState(movingPoint ? movingPoint.alt_type : 0);
  const [type, setType] = useState(point.type);
  const [name, setName] = useState(point.name);
  const [speed, setSpeed] = useState(point.speed);
  const [action, setAction] = useState(point.action);
  const [currentPointIndex, setCurrentPointIndex] = useState(pointIndex);
  const [useImperial, setImperial] = useState(true);

  if (pointIndex !== currentPointIndex) {
    setAlt(point.alt);
    setType(point.type);
    setName(point.name);
    setSpeed(point.speed);
    setAction(point.action);
    setCurrentPointIndex(pointIndex);

    if (movingPoint) {
      setAltType(movingPoint.alt_type);
    }
  }

  const actionsOptions = Object.keys(PointAction).map((key, value) => ({
    value: key,
    label: Object.values(PointAction)[value]
  }));

  const saveWaypointOnClick = () => {
    // TODO validate
    gameService.sendRouteModify(group, point.position, {
      ...point,
      alt: alt,
      alt_type: altType,
      type: type,
      name: name,
      speed: speed,
      action: action
    } as MovingPoint);

    selectWaypoint(undefined);
  };

  const onActionChange = (event: any) => {
    setType(PointAction[event.target.value]);
    setAction(event.target.value);
  };

  const closeOnClick = () => selectWaypoint(undefined);
  const onUnitsSystemChange = (event: React.ChangeEvent<HTMLInputElement>) => setImperial(event.target.checked);
  const onAltTypeChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setAltType(event.target.checked ? AltType.BARO : AltType.RADIO);

  return (
    <div className="Popup">
      <p>Group name: {group.name}</p>
      <p>Waypoint number: {pointIndex}</p>
      <p>
        Alt:{' '}
        <input
          type="text"
          pattern="[0-100000]"
          value={useImperial ? alt * c_MeterToFeet : alt}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setAlt(useImperial ? +event.target.value / c_MeterToFeet : +event.target.value);
          }}
        />
        <FormControlLabel
          value="start"
          control={<Checkbox checked={useImperial} color="primary" onChange={onUnitsSystemChange} />}
          label="ft"
          labelPlacement="end"
        />
        {altType && (
          <FormControlLabel
            value="start"
            control={<Checkbox checked={altType === AltType.BARO} color="primary" onChange={onAltTypeChange} />}
            label="baro"
            labelPlacement="end"
          />
        )}
      </p>
      <p>
        Name:{' '}
        <input
          type="text"
          value={name}
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
          value={speed}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setSpeed(+event.target.value);
          }}
        />
      </p>
      <React.Fragment>
        Action:
        <Select onChange={onActionChange} value={action}>
          {actionsOptions.map((option, i) => (
            <MenuItem key={`actionsOptions${i}`} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </React.Fragment>
      <p>
        <button onClick={saveWaypointOnClick}>Save waypoint</button>
        <button onClick={closeOnClick}>Close</button>
      </p>
    </div>
  );
}
