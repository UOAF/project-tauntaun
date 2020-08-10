import { pick } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { Dictionary, Point, Mission, Group, emptyMission, StaticPoint } from '../models';
import { LatLng } from 'leaflet';

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

  getMission(): Promise<Mission>;

  registerForMissionUpdates(listener: MissionUpdateListener): string;
  unregisterMissionUpdateListener(id: string): void;
}

let socket: WebSocket | null = null;
const updateListeners: Dictionary<MissionUpdateListener> = {};

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
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('socket not open');
    return;
  }

  socket.send(
    JSON.stringify({
      key: 'group_route_insert_at',
      value: {
        ...pick(group, ['id']),
        new: pick(newWp, ['lat', 'lon']),
        at: pick(atWp, ['lat', 'lon'])
      }
    })
  );
}

function sendRouteRemove(group: Group, wp: Point): void {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('socket not open');
    return;
  }

  socket.send(
    JSON.stringify({
      key: 'group_route_remove',
      value: {
        ...pick(group, ['id']),
        point: pick(wp, ['lat', 'lon'])
      }
    })
  );
}

function sendRouteModify(group: Group, oldWp: Point, newWp: StaticPoint): void {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('socket not open');
    return;
  }

  socket.send(
    JSON.stringify({
      key: 'group_route_modify',
      value: {
        ...pick(group, ['id']),
        old: pick(oldWp, ['lat', 'lon']),
        new: newWp
      }
    })
  );
}

function sendSaveMission(): void {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('socket not open');
    return;
  }

  socket.send(
    JSON.stringify({
      key: 'save_mission',
      value: ''
    })
  );
}

function sendAddFlight(location: LatLng, airport: number, plane: string, numberOfPlanes: number): void {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('socket not open');
    return;
  }

  socket.send(
    JSON.stringify({
      key: 'add_flight',
      value: {
        location: { lat: location.lat, lon: location.lng },
        airport: airport,
        plane: plane,
        number_of_planes: numberOfPlanes
      }
    })
  );
}
function sendLoadMission(): void {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('socket not open');
    return;
  }

  socket.send(
    JSON.stringify({
      key: 'load_mission',
      value: ''
    })
  );
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
  sendSaveMission,
  sendLoadMission,
  sendAddFlight,
  getMission,
  registerForMissionUpdates,
  unregisterMissionUpdateListener
};
