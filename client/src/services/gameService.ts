import { pick } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { Unit, Dictionary, Point } from '../models';

export type ForceColor = 'blue' | 'red' | 'neutral';
export type GetType = 'ships' | 'plane_groups';

export type UnitUpdateListener = (updatedUnit: Unit) => void;

export interface GameService {
  openSocket(): Promise<void>;

  sendRouteUpdate(unit: Unit): void;
  sendRouteInsertAt(unit: Unit, newWp: Point, atWp: Point): void;
  sendRouteRemove(unit: Unit, wp: Point): void;
  sendRouteModify(unit: Unit, oldWp: Point, newWp: Point): void;
  sendSaveMission(): void;

  getShips(color: string): Promise<Unit[]>;
  getPlanes(color: string): Promise<Unit[]>;

  registerForUnitUpdates(listener: UnitUpdateListener): string;
  unregisterUnitUpdateListener(id: string): void;
}

let socket: WebSocket | null = null;
const updateListeners: Dictionary<UnitUpdateListener> = {};

async function getUnits(type: GetType, color: ForceColor): Promise<Unit[]> {
  try {
    const response = await fetch(`/game/${type}/${color}`);
    const units = (await response.json()) as Unit[];
    return units.map(unit => ({
      ...unit,
      uniqueId: uuidv4(),
      isSelected: false
    }));
  } catch (error) {
    console.error(`couldn't fetch planes`, error);
    return [];
  }
}

function receiveUpdateMessage(event: any) {
  const message = JSON.parse(event.data);
  if (message.key !== 'unit_group_updated') {
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

function sendRouteUpdate(unit: Unit): void {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('socket not open');
    return;
  }  

  socket.send(
    JSON.stringify({
      key: 'unit_route_update',
      value: {
        ...pick(unit, ['id', 'name']),
        points: unit.points.map(point => pick(point, ['lat', 'lon']))
      }
    })
  );
}

function sendRouteInsertAt(unit: Unit, newWp: Point, atWp: Point): void {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('socket not open');
    return;
  }  

  socket.send(
    JSON.stringify({
      key: 'unit_route_insert_at',
      value: {
        ...pick(unit, ['id', 'name']),
        new: pick(newWp, ['lat', 'lon']),
        at: pick(atWp, ['lat', 'lon'])
      }
    })
  );
}

function sendRouteRemove(unit: Unit, wp: Point): void {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('socket not open');
    return;
  }  

  socket.send(
    JSON.stringify({
      key: 'unit_route_remove',
      value: {
        ...pick(unit, ['id', 'name']),
        point: pick(wp, ['lat', 'lon'])
      }
    })
  );
}

function sendRouteModify(unit: Unit, oldWp: Point, newWp: Point): void {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('socket not open');
    return;
  }  

  socket.send(
    JSON.stringify({
      key: 'unit_route_modify',
      value: {
        ...pick(unit, ['id', 'name']),
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

async function getShips(color: ForceColor): Promise<Unit[]> {
  return getUnits('ships', color);
}

async function getPlanes(color: ForceColor): Promise<Unit[]> {
  return getUnits('plane_groups', color);
}

function registerForUnitUpdates(listener: UnitUpdateListener): string {
  const id = uuidv4();
  updateListeners[id] = listener;
  return id;
}

function unregisterUnitUpdateListener(id: string): void {
  if (updateListeners[id]) {
    delete updateListeners[id];
  }
}

export const gameService: GameService = {
  openSocket,
  sendRouteUpdate,  
  sendRouteInsertAt,
  sendRouteRemove,
  sendRouteModify,
  sendSaveMission,
  getShips,
  getPlanes,
  registerForUnitUpdates,
  unregisterUnitUpdateListener
};
