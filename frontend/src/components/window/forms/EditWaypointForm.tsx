import './EditWaypointForm.css';

import React, { useState } from 'react';
import { MenuItem, Select, Switch, FormControlLabel, SelectChangeEvent } from '@mui/material';
import { AltType, SelectionStateContainer, Group, MovingPoint, PointAction } from '../../../models';
import { gameService } from '../../../services';
import { c_MeterToFeet } from '../../../data/constants';
import { clamp } from 'lodash';

export interface EditWaypointFormProps {
  group: Group;
  pointIndex: number;
}

export function EditWaypointForm(props: EditWaypointFormProps) {
  const { selectWaypoint } = SelectionStateContainer.useContainer();

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

  const onActionChange = (event: SelectChangeEvent) => {
    setType(PointAction[event.target.value]);
    setAction(event.target.value);
  };

  const closeOnClick = () => selectWaypoint(undefined);

  const onUnitsSystemChange = () => {
    setImperial(!useImperial);
  };

  const onAltTypeChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setAltType(event.target.checked ? AltType.BARO : AltType.RADIO);

  const onWpNumberUp = () => {
    selectWaypoint(clamp(currentPointIndex + 1, 0, group.points.length - 1));
  };

  const onWpNumberDown = () => {
    selectWaypoint(clamp(currentPointIndex - 1, 0, group.points.length - 1));
  };

  const onSetTargetClicked = () => {
    setAltType(AltType.RADIO);
    setAlt(0);
  };

  const graySwitchStyle = {
    switchBase: {
      color: 'rgba(49, 107, 170, 1)',
      $track: {
        backgroundColor: 'rgba(0,0,0,0.38)'
      }
    },
  };

  return (
    <section className="EditWaypointContainer">
      <header>
        <h2>Group name: {group.name}</h2>
      </header>
      <div>
        <div className="WaypointNumber">
          <div>
            <span>Waypoint</span>
            <p>{currentPointIndex}</p>
          </div>
          <div className="WaypointButtonContainer">
            <button onClick={onWpNumberDown}>Prev</button>
            <button onClick={onWpNumberUp}>Next</button>
          </div>
        </div>
      </div>
      <div className="WaypointAltitude">
        <span className="WaypointAltitudeTitle">Altitude</span>
        <input
          type="text"
          pattern="[0-100000]"
          value={useImperial ? alt * c_MeterToFeet : alt}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setAlt(useImperial ? +event.target.value / c_MeterToFeet : +event.target.value);
          }}
        />
        <div className="Toggle">
          <span>Meters</span>
          <FormControlLabel
            control={
              <Switch
                sx={graySwitchStyle}
                checked={useImperial}
                onChange={onUnitsSystemChange}
                name="Use Imperial"
                size="small"
                color="default"
              />
            }
            label=""
          />
          <span>Feet</span>
        </div>
        {altType && (
          <div className="Toggle">
            <span>AGL</span>
            <FormControlLabel
              control={
                <Switch
                  sx={graySwitchStyle}
                  checked={altType === AltType.BARO}
                  onChange={onAltTypeChange}
                  name="Use Imperial"
                  size="small"
                  color="default"
                />
              }
              label=""
            />
            <span>MSL</span>
          </div>
        )}
      </div>
      <button onClick={onSetTargetClicked}>Set as ground target</button>
      <div className="fieldContainer">
        <span>Name</span>
        <input
          type="text"
          value={name}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setName(event.target.value);
          }}
        />
      </div>
      <div className="fieldContainer">
        <span>Speed</span>
        <input
          type="text"
          pattern="[0-2]{0,1}[0-9]{1,3}[\.,][0-9]+"
          value={speed}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setSpeed(+event.target.value);
          }}
        />
      </div>
      <div className="fieldContainer">
        <span>Action</span>
        <Select onChange={onActionChange} value={action}>
          {actionsOptions.map((option, i) => (
            <MenuItem key={`actionsOptions${i}`} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </div>
      <div>
        <button onClick={saveWaypointOnClick}>Save waypoint</button>
        <button onClick={closeOnClick}>Close</button>
      </div>
    </section>
  );
}
