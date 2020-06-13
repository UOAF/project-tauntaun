import { Dictionary } from './util';

export type TaskParam = {
  auto: boolean;
  enabled: boolean;
  id: string;
  number: number;
};

export type TaskParams = {
  tasks: Dictionary<TaskParam>;
};

export type Task = {
  id: string;
  params: TaskParams;
};

export type Point = {
  ETA: number;
  ETA_Locked: boolean;
  action: string;
  alt: number;
  alt_type: string;
  formation_template: string;
  lat: number;
  lon: number;
  name: string;
  speed: number;
  speed_locked: boolean;
  type: string;
  x: number;
  y: number;
};

export type Position = {
  lat: number;
  lon: number;
};

export type Unit = {
  id: number;
  name: string;
  num: number;
  points: Point[];
  position: Position;
  sidc: string;
};
