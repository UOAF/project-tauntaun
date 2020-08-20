import { Dictionary } from './util';

// TODO move data to dcs_static.json
export const PointAction: Dictionary<string> = {
  TurningPoint: 'Turning Point',
  FlyOverPoint: 'Fly Over Point',
  FromParkingArea: 'From Parking Area',
  FromParkingAreaHot: 'From Parking Area Hot',
  FromRunway: 'From Runway',
  Landing: 'Landing',
  OnRoad: 'On Road',
  OffRoad: 'Off Road',
  LineAbreast: 'Rank',
  Cone: 'Cone',
  Vee: 'Vee',
  Diamond: 'Diamond',
  EchelonLeft: 'EchelonL',
  EchelonRight: 'EchelonR',
  FromGroundArea: 'From Ground Area',
  FromGroundAreaHot: 'From Ground Area Hot',
  Custom: 'Custom'
};

export type Plane = {
  flyable: boolean;
  group_size_max: number;
  large_parking_slot: boolean;
  helicopter: boolean;
  fuel_max: number;
  chaff: number;
  flare: number;
  charge_total: number;
  chaff_charge_size: number;
  flare_charge_size: number;
  category: string;
  tacan: boolean;
  eplrs: boolean;
  radio_frequency: number;
  pylons: Dictionary<Array<string>>;
};

export type Weapon = {
  name: string;
  weight: number;
  weapon_id: string;
};

export type Vehicle = {
  id: string;
  name: string;
  detection_range: string;
  threat_range: string;
  air_weapon_dist: string;
  eprls: boolean;
  category: string;
};

export type DcsStaticData = {
  planes: Dictionary<Plane>;
  weapons: Dictionary<Weapon>;
  vehicles: Dictionary<Vehicle>;
  sidc: Dictionary<string>;
};
