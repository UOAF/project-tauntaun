import { Dictionary } from './';

export enum AltType {
  BARO = 'BARO',
  RADIO = 'RADIO'
}

export enum Coalitions {
  BLUE = 'blue',
  RED = 'red',
  NEUTRAL = 'neutrals',
  NEUTRAL_2 = 'neutral' // It's "neutral" for airbases
}

export enum Skill {
  Client = 'Skill.Client',
  Player = 'Skill.Player'
}

export type PlaneType = {
  id: string;
};

export type Airport = {
  id: number;
  name: string;
  position: Point;
  coalition: string;
};

export type Terrain = {
  name: string;
  airports: Dictionary<Airport>;
  center: Point;
  map_view_default: Point;
};

export type Point = {
  lat: number;
  lon: number;
};

export type StaticPoint = {
  alt: number;
  type: string;
  name: string;
  position: Point;
  speed: number;
  action: string;
};

export type MovingPoint = StaticPoint & {
  alt_type: string;
};

export type Pylon = {
  CLSID: string;
};

export type FlyingUnit = Unit & {
  flare: number;
  chaff: number;
  fuel: number;
  gun: number;
  pylons: Dictionary<Pylon>;
  radio: string; // TODO
  hardpoint_racks: boolean;
  [key: string]: boolean | number | string | Dictionary<Pylon>;
};

export type Unit = {
  id: number;
  name: string;
  type: string;
  position: Point;
  skill: string;
};

export type Group = {
  id: number;
  name: string;
  units: Array<Unit | FlyingUnit>;
  points: Array<MovingPoint | StaticPoint>;
  task: string;
  hidden: string; // boolean as string
  dead: string; // boolean as string
  hidden_on_planner: string; // boolean as string
};

export type Country = {
  id: number;
  name: string;
  vehicle_group: Array<Group>;
  ship_group: Array<Group>;
  plane_group: Array<Group>;
  helicopter_group: Array<Group>;
  static_group: Array<Group>;
  planes: Array<PlaneType>;
  [key: string]: Array<Group> | number | string | Array<PlaneType>;
};

export type Coalition = {
  name: string;
  bullseye: Point;
  countries: Dictionary<Country>;
};

export type Mission = {
  terrain: Terrain;
  coalition: Dictionary<Coalition>;
  start_time: string;
};

export const emptyMission: Mission = {
  terrain: {
    name: '',
    airports: {},
    center: { lat: 43, lon: 41 },
    map_view_default: { lat: 43, lon: 41 }
  },
  coalition: {},
  start_time: '1970-01-01 00:00:00'
};
