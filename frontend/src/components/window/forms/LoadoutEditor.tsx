import './LoadoutEditor.css';

import React, { useState } from 'react';
import { Slider } from '@material-ui/core';
import { Select } from '@material-ui/core';
import { MenuItem } from '@material-ui/core';
import { InputLabel } from '@material-ui/core';
import {
  AppStateContainer,
  DcsStaticData,
  DcsStaticDataStateContainer,
  Dictionary,
  findGroupById,
  FlyingUnit,
  getGroupOfUnit,
  MissionStateContainer,
  Unit
} from '../../../models';
import { gameService } from '../../../services';
import { SelectOptionType } from '../../../types/material_ui';
import { ModeContext } from '../../contexts';
import { isLeadOfFlight } from '../../common';

const pylonStyle = { minWidth: 200, maxWidth: 200, margin: '5px' };

export interface LoadoutEditorProps {
  unit: Unit;
}

export function LoadoutEditor(props: LoadoutEditorProps) {
  const { dcsStaticData } = DcsStaticDataStateContainer.useContainer();
  const { setShowLoadoutEditor } = AppStateContainer.useContainer();
  const { mission } = MissionStateContainer.useContainer();

  const { selectedGroupId, selectedUnitId } = React.useContext(ModeContext);

  const { unit } = props;

  const unitData = dcsStaticData.planes[unit.type];
  const weaponsData = dcsStaticData.weapons;
  const flyingUnit = unit as FlyingUnit;

  const getWeaponByClsid = (clsid: string) => {
    return Object.keys(weaponsData)
      .filter(key => weaponsData[key].weapon_id === clsid)
      .map(key => ({ ...weaponsData[key], key: key }))
      .pop();
  };

  const c_EmptyOption = 'empty';
  const getUnitPylons = (): Dictionary<string> => {
    if (!unitData) return {};
    if (!flyingUnit.pylons) return {};

    return Object.entries(flyingUnit.pylons)
      .map(keyValue => {
        const [key, value] = keyValue;
        const weapon = getWeaponByClsid(value.CLSID)?.key;
        console.assert(weapon !== undefined);
        return {
          key: key,
          value: weapon ? weapon : c_EmptyOption
        };
      })
      .reduce((accumulator, currentValue) => ({ ...accumulator, [currentValue.key]: currentValue.value }), {});
  };

  const [pylons, setPylons] = useState(getUnitPylons());
  const [chaff, setChaff] = useState(unitData !== undefined ? flyingUnit.chaff : 0);
  const [flare, setFlare] = useState(unitData !== undefined ? flyingUnit.flare : 0);
  const [fuel, setFuel] = useState(unitData !== undefined ? flyingUnit.fuel : 0);
  const [gun, setGun] = useState(unitData !== undefined ? flyingUnit.gun : 0);

  const group = selectedGroupId ? findGroupById(mission, selectedGroupId) : undefined;
  const isSelectedUnitLeadOfFlight = isLeadOfFlight(selectedUnitId, group);

  const emptyOption = { value: c_EmptyOption, label: 'Empty' };
  let pylonOptions: any[] = [];
  if (unitData) {
    pylonOptions = Object.keys(unitData.pylons).map(key => {
      const pylonData = unitData.pylons[key];
      return {
        pylonNumber: key,
        options: [
          ...pylonData.map(value => {
            return { value: value, label: dcsStaticData.weapons[value].name };
          }),
          emptyOption
        ]
      };
    });
  }

  const onPylonWeaponSelected = (event: any, pylonNumber: number) => {
    const value = event.target.value;

    if (value === c_EmptyOption) {
      const newPylons: any = { ...pylons };
      delete newPylons[pylonNumber];
      setPylons(newPylons);
    } else {
      setPylons({
        ...pylons,
        [pylonNumber]: value
      });
    }
  };

  const chargeLeft = () => {
    const left = unitData.charge_total - chaff * unitData.chaff_charge_size - flare * unitData.flare_charge_size;
    return left < 0 ? 0 : left;
  };

  // eslint-disable-next-line @typescript-eslint/ban-types
  const onChaffChange = (event: object, value: number | number[]) => {
    const maxFreeCharges = chargeLeft();
    let newCharges = ((value as number) - chaff) * unitData.chaff_charge_size;
    if (newCharges > maxFreeCharges) newCharges = maxFreeCharges;
    setChaff(chaff + Math.floor(newCharges / unitData.chaff_charge_size));
  };

  // eslint-disable-next-line @typescript-eslint/ban-types
  const onFlareChange = (event: object, value: number | number[]) => {
    const maxFreeCharges = chargeLeft();
    let newCharges = ((value as number) - flare) * unitData.flare_charge_size;
    if (newCharges > maxFreeCharges) newCharges = maxFreeCharges;
    setFlare(flare + Math.floor(newCharges / unitData.flare_charge_size));
  };

  // eslint-disable-next-line @typescript-eslint/ban-types
  const onGunChange = (event: object, value: number | number[]) => setGun(value as number);

  // eslint-disable-next-line @typescript-eslint/ban-types
  const onFuelChange = (event: object, value: number | number[]) => setFuel(value as number);

  const convertPylonsForGameService = () => {
    const weaponsData = dcsStaticData.weapons;
    return Object.keys(pylons)
      .map(k => {
        return { [k]: weaponsData[pylons[k]].weapon_id };
      })
      .reduce((a, c) => {
        return { ...a, ...c };
      }, {});
  };

  const onSaveClicked = () => {
    console.log('Send new loadout.');
    setShowLoadoutEditor(false);
    gameService.sendUnitLoadoutUpdate(unit, convertPylonsForGameService(), chaff, flare, fuel, gun);
  };

  const onSaveForGroupClicked = () => {
    console.log('Send new loadout for group.');
    setShowLoadoutEditor(false);

    const group = getGroupOfUnit(mission, unit.id);
    const convertedPylons = convertPylonsForGameService();
    group?.units.forEach(u => gameService.sendUnitLoadoutUpdate(u, convertedPylons, chaff, flare, fuel, gun));
  };

  const renderPylonSelect = (pylonOption: any) => {
    const pylonNumber = pylonOption.pylonNumber as number;
    return (
      <div className="Pylon" key={pylonNumber}>
        <InputLabel id={'pylon-select-label-' + pylonNumber}>{pylonNumber}</InputLabel>
        <Select
          style={pylonStyle}
          labelId={'pylon-select-label-' + pylonNumber}
          id={'pylon-select-' + pylonNumber}
          value={pylons[pylonNumber] ? pylons[pylonNumber] : ''}
          onChange={(event: any) => onPylonWeaponSelected(event, pylonNumber)}
        >
          {pylonOption.options.map((v: SelectOptionType, i: number) => (
            <MenuItem key={`pylonOption${i}`} value={v.value}>
              {v.label}
            </MenuItem>
          ))}
        </Select>
      </div>
    );
  };

  const closeOnClick = () => setShowLoadoutEditor(false);

  if (unitData) {
    return (
      <div className="LoadoutEditor">
        <p>Unit type: {unit.type}</p>
        <div className="sliderContainer">
          <div className="singleSlider">
            <span>Chaff</span>
            <Slider
              defaultValue={chaff}
              value={chaff}
              min={0}
              max={unitData.charge_total / unitData.chaff_charge_size}
              valueLabelDisplay="auto"
              onChange={onChaffChange}
              onChangeCommitted={onChaffChange}
            />
          </div>
          <div className="singleSlider">
            <span>Flare</span>
            <Slider
              defaultValue={flare}
              value={flare}
              min={0}
              max={unitData.charge_total / unitData.flare_charge_size}
              valueLabelDisplay="auto"
              onChange={onFlareChange}
              onChangeCommitted={onFlareChange}
            />
          </div>
          <div className="singleSlider">
            <span>Gun</span>
            <Slider
              defaultValue={gun}
              step={1}
              min={0}
              max={100}
              valueLabelDisplay="auto"
              onChangeCommitted={onGunChange}
            />
          </div>
          <div className="singleSlider">
            <span>Fuel</span>
            <Slider
              defaultValue={fuel}
              step={1}
              min={0}
              max={unitData.fuel_max}
              valueLabelDisplay="auto"
              onChangeCommitted={onFuelChange}
            />
          </div>
        </div>
        <div className="pylonContainer">{pylonOptions.map(pylonOption => renderPylonSelect(pylonOption))}</div>
        <div className="buttonContainer">
          <button onClick={onSaveClicked}>Save</button>
          {isSelectedUnitLeadOfFlight && <button onClick={onSaveForGroupClicked}>Save for group</button>}
          <button onClick={closeOnClick}>Close</button>
        </div>
      </div>
    );
  } else {
    return <div>No unit data available for {unit.type}!</div>;
  }
}
