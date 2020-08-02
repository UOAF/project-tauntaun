import { pick } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { Dictionary, Point, Mission, Group } from '../models';

export type ForceColor = 'blue' | 'red' | 'neutral';
export type GetType = 'ships' | 'plane_groups';

export type MissionUpdateListener = (updatedMission: Mission) => void;

export interface GameService {
  openSocket(): Promise<void>;

  sendRouteInsertAt(group: Group, newWp: Point, atWp: Point): void;
  sendRouteRemove(group: Group, wp: Point): void;
  sendRouteModify(group: Group, oldWp: Point, newWp: Point): void;
  sendSaveMission(): void;

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
    return { coalition: {}};
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

function sendRouteInsertAt(group: Group, newWp: Point, atWp: Point): void {
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

function sendRouteModify(group: Group, oldWp: Point, newWp: Point): void {
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
        new: pick(newWp, ['lat', 'lon'])
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
  getMission,  
  registerForMissionUpdates,
  unregisterMissionUpdateListener
};
