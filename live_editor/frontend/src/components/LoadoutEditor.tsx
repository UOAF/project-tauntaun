import React, { useState } from 'react';
import * as DcsStaticRawJson from '../data/dcs_static.json';
import { Unit, AppStateContainer, DcsStaticData } from '../models';
import { FlyingUnit } from '../models/dcs';
import { Slider } from '@material-ui/core';
import { Select } from '@material-ui/core';
import { MenuItem } from '@material-ui/core';
import { InputLabel } from '@material-ui/core';
import { gameService } from '../services';
import { SelectOptionType } from '../types/material_ui';
import { Dictionary } from '../models/util';

export interface LoadoutEditorProps {
  unit: Unit;
}

export function LoadoutEditor(props: LoadoutEditorProps) {
  const appState = AppStateContainer.useContainer();
  const { unit } = props;

  const DcsStatic = (DcsStaticRawJson as any).default as DcsStaticData;
  const unitData = DcsStatic.planes[unit.type];
  const weaponsData = DcsStatic.weapons;
  const flyingUnit = unit as FlyingUnit;

  const chargeLeft = () => {
    return unitData.charge_total - chaff / unitData.chaff_charge_size - flare / unitData.flare_charge_size;
  };
  
  const getWeaponByClsid = (clsid: string) => {
    return Object.keys(weaponsData)
    .filter(key => weaponsData[key].weapon_id === clsid)
    .map(key => {
       return { ...weaponsData[key], key: key };
     }).pop();
  };

  let unitPylons: Dictionary<string> = {};
  if (unitData && flyingUnit.pylons) {
    const flyingUnitPylons = flyingUnit.pylons;
    const values = Object.keys(flyingUnitPylons).map(key => {
      const weapon = getWeaponByClsid(flyingUnitPylons[key]['CLSID']);
      return { key: key, value: weapon?.key};
    });
    values.forEach(value => {
      console.assert(value.value !== undefined);
      unitPylons = {
        ...unitPylons,
        [value.key]: value.value ? value.value : "empty"
      };
    });
  }

  const [pylons, setPylons] = useState(unitPylons);
  const [chaff, setChaff] = useState(unitData !== undefined ? flyingUnit.chaff : 0);
  const [flare, setFlare] = useState(unitData !== undefined ? flyingUnit.flare : 0);
  const [fuel, setFuel] = useState(unitData !== undefined ? flyingUnit.fuel : 0);
  const [gun, setGun] = useState(unitData !== undefined ? flyingUnit.gun : 0);

  const emptyOption = { value: 'empty', label: 'X' };

  let pylonOptions: any[] = [];
  if (unitData) {
    pylonOptions = Object.keys(unitData.pylons).map(key => {
      const pylonData = unitData.pylons[key];
      return {
        pylonNumber: key,
        options: [
          ...(pylonData.map(value => {
          return { value: value, label: DcsStatic.weapons[value].name };
        })),
        emptyOption
      ]
      };
    });
  }

  const onPylonWeaponSelected = (event: any, pylonNumber: number) => {
    const value = event.target.value;

    if (value === 'empty') {
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

  // eslint-disable-next-line @typescript-eslint/ban-types
  const onChaffChange = (event: object, value: number | number[]) => {
    const maxFreeCharges = chargeLeft();
    let newCharges = ((value as number) - chaff) / unitData.chaff_charge_size;
    if (newCharges > maxFreeCharges) newCharges = maxFreeCharges;
    setChaff(chaff + newCharges * unitData.chaff_charge_size);
  };

  // eslint-disable-next-line @typescript-eslint/ban-types
  const onFlareChange = (event: object, value: number | number[]) => {
    const maxFreeCharges = chargeLeft();
    let newCharges = ((value as number) - flare) / unitData.flare_charge_size;
    if (newCharges > maxFreeCharges) newCharges = maxFreeCharges;
    setFlare(flare + newCharges * unitData.flare_charge_size);
  };

  // eslint-disable-next-line @typescript-eslint/ban-types
  const onGunChange = (event: object, value: number | number[]) => {
    setGun(value as number);
  };

  // eslint-disable-next-line @typescript-eslint/ban-types
  const onFuelChange = (event: object, value: number | number[]) => {
    setFuel(value as number);
  };

  const onSaveClicked = () => {
    console.log('Send new loadout.');
    appState.selectUnit(undefined);
    gameService.sendUnitLoadoutUpdate(unit, pylons, chaff, flare, fuel, gun);
  };

  const renderPylonSelect = (pylonOption: any) => {
    const pylonNumber = pylonOption.pylonNumber as number;
    return (
    <div className="PylonSelect" key={pylonNumber}>
      <InputLabel id={"pylon-select-label-" + pylonNumber}>{pylonNumber}</InputLabel>
      <Select
        labelId={"pylon-select-label-" + pylonNumber}
        id={"pylon-select-" + pylonNumber}
        defaultValue={pylons[pylonNumber]}
        onChange={(event: any) => onPylonWeaponSelected(event, pylonNumber)}>
            {pylonOption.options.map((v: SelectOptionType) => (<MenuItem value={v.value}>{v.label}</MenuItem>))}
      </Select>
    </div>);   
  }

  if (unitData) {
    return (
      <div className="PopupBig">
        <p>Unit type: {unit.type}</p>
        Chaff
        <Slider
          defaultValue={chaff}
          value={chaff}
          step={unitData.chaff_charge_size}
          min={0}
          max={unitData.charge_total * unitData.chaff_charge_size}
          valueLabelDisplay="auto"
          onChange={onChaffChange}
          onChangeCommitted={onChaffChange}
        />
        Flare
        <Slider
          defaultValue={flare}
          value={flare}
          step={unitData.flare_charge_size}
          min={0}
          max={unitData.charge_total * unitData.flare_charge_size}
          valueLabelDisplay="auto"
          onChange={onFlareChange}
          onChangeCommitted={onFlareChange}
        />
        Gun
        <Slider
          defaultValue={gun}
          step={1}
          min={0}
          max={100}
          valueLabelDisplay="auto"
          onChangeCommitted={onGunChange}
        />
        Fuel
        <Slider
          defaultValue={fuel}
          step={1}
          min={0}
          max={unitData.fuel_max}
          valueLabelDisplay="auto"
          onChangeCommitted={onFuelChange}
        />
        {pylonOptions.map(pylonOption => renderPylonSelect(pylonOption))}        
        <p>
          <button onClick={onSaveClicked}>Save loadout</button>
        </p>
      </div>
    );
  } else {
    return <div>No unit data available for {unit.type}!</div>;
  }
}
