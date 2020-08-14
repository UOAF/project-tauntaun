import { pick } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { Dictionary, Point, Mission, Group, emptyMission, StaticPoint, Unit } from '../models';
import { LatLng } from 'leaflet';

import * as DcsStaticRawJson from '../data/dcs_static.json';

export type ForceColor = 'blue' | 'red' | 'neutral';
export type GetType = 'ships' | 'plane_groups';

export type MissionUpdateListener = (updatedMission: Mission) => void;

export interface GameService {
  openSocket(): Promise<void>;

  sendRouteInsertAt(group: Group, atWp: Point, newWp: Point): void;
  sendRouteRemove(group: Group, wp: Point): void;
  sendRouteModify(group: Group, oldWp: Point, newWp: StaticPoint): void;
  sendSaveMission(): void;
  sendLoadMission(): void;
  sendAddFlight(location: LatLng, airport: number, plane: string, numberOfPlanes: number): void;
  sendUnitLoadoutUpdate(
    unit: Unit,
    pylons: Dictionary<string>,
    chaff: number,
    flare: number,
    fuel: number,
    gun: number
  ): void;

  getMission(): Promise<Mission>;

  registerForMissionUpdates(listener: MissionUpdateListener): string;
  unregisterMissionUpdateListener(id: string): void;
}

let socket: WebSocket | null = null;
const updateListeners: Dictionary<MissionUpdateListener> = {};

function sendMessage(name: string, value: any) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('socket not open');
    return;
  }

  socket.send(JSON.stringify({ key: name, value: value }));
}

async function getMission(): Promise<Mission> {
  try {
    const response = await fetch('/game/mission');
    const mission = (await response.json()) as Mission;
    return mission;
  } catch (error) {
    console.error(`Couldn't fetch mission`, error);
    return emptyMission;
  }
}

function receiveUpdateMessage(event: any) {
  const message = JSON.parse(event.data);
  if (message.key !== 'mission_updated') {
    return;
  }

  Object.keys(updateListeners).forEach(key => updateListeners[key](message.value));
}

async function openSocket(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL('/ws/update', window.location.href);
      url.protocol = url.protocol.replace('http', 'ws');
      url.port = '8080';
      socket = new WebSocket(url.toString());
      socket.onopen = () => resolve();
      socket.onmessage = receiveUpdateMessage;
    } catch (error) {
      reject(error);
    }
  });
}

function sendRouteInsertAt(group: Group, atWp: Point, newWp: Point): void {
  sendMessage('group_route_insert_at', {
    ...pick(group, ['id']),
    new: pick(newWp, ['lat', 'lon']),
    at: pick(atWp, ['lat', 'lon'])
  });
}

function sendRouteRemove(group: Group, wp: Point): void {
  sendMessage('group_route_remove', {
    ...pick(group, ['id']),
    point: pick(wp, ['lat', 'lon'])
  });
}

function sendRouteModify(group: Group, oldWp: Point, newWp: StaticPoint): void {
  sendMessage('group_route_modify', {
    ...pick(group, ['id']),
    old: pick(oldWp, ['lat', 'lon']),
    new: newWp
  });
}

function sendSaveMission(): void {
  sendMessage('save_mission', '');
}

function sendAddFlight(location: LatLng, airport: number, plane: string, numberOfPlanes: number): void {
  sendMessage('add_flight', {
    location: { lat: location.lat, lon: location.lng },
    airport: airport,
    plane: plane,
    number_of_planes: numberOfPlanes
  });
}
function sendLoadMission(): void {
  sendMessage('load_mission', '');
}

function sendUnitLoadoutUpdate(
  unit: Unit,
  pylons: Dictionary<string>,
  chaff: number,
  flare: number,
  fuel: number,
  gun: number
): void {
  const weaponsData = (DcsStaticRawJson as any).default.weapons;
  sendMessage('unit_loadout_update', {
    id: unit.id,
    pylons: Object.keys(pylons).map(k => {
        return { [k]: weaponsData[pylons[k]].weapon_id };
      })
      .reduce((a, c) => {
        return { ...a, ...c };
      }, {}),
    chaff: chaff,
    flare: flare,
    gun: gun,
    fuel: fuel
  });
}

function registerForMissionUpdates(listener: MissionUpdateListener): string {
  const id = uuidv4();
  updateListeners[id] = listener;
  return id;
}

function unregisterMissionUpdateListener(id: string): void {
  if (updateListeners[id]) {
    delete updateListeners[id];
  }
}

export const gameService: GameService = {
  openSocket,
  sendRouteInsertAt,
  sendRouteRemove,
  sendRouteModify,
  sendUnitLoadoutUpdate,
  sendSaveMission,
  sendLoadMission,
  sendAddFlight,
  getMission,
  registerForMissionUpdates,
  unregisterMissionUpdateListener
};
