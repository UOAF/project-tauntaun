import { pick } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { Unit } from '../models/unit';

export type ForceColor = 'blue' | 'red' | 'neutral';
export type GetType = 'ships' | 'plane_groups';

export interface GameService {
  openSocket(): Promise<void>;

  updateUnitRoute(unit: Unit): void;

  getShips(color: string): Promise<Unit[]>;
  getPlanes(color: string): Promise<Unit[]>;
}

let socket: WebSocket | null = null;

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

async function openSocket(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL('/ws/update', window.location.href);
      url.protocol = url.protocol.replace('http', 'ws');
      url.port = '80';
      socket = new WebSocket(url.toString());
      socket.onopen = () => resolve();
    } catch (error) {
      reject(error);
    }
  });
}

function updateUnitRoute(unit: Unit): void {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('socket not open');
    return;
  }

  socket.send(
    JSON.stringify({
      key: 'unit_route_updated',
      value: {
        ...pick(unit, ['id', 'name']),
        points: unit.points.map(point => pick(point, ['lat', 'lon']))
      }
    })
  );
}

async function getShips(color: ForceColor): Promise<Unit[]> {
  return getUnits('ships', color);
}

async function getPlanes(color: ForceColor): Promise<Unit[]> {
  return getUnits('plane_groups', color);
}

export const gameService: GameService = {
  openSocket,
  updateUnitRoute,
  getShips,
  getPlanes
};
