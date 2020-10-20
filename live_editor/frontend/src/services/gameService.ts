import { pick } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { Dictionary, Point, Mission, Group, emptyMission, MovingPoint, Unit, StaticPoint } from '../models';
import { LatLng } from 'leaflet';

import * as DcsStaticRawJson from '../data/dcs_static.json';
import { Sessions, SessionData } from '../models/sessionData';

export type MissionUpdateListener = (updatedMission: Mission) => void;
export type SessionsUpdateListener = (updatedSessions: Sessions) => void;
export type SessionIdUpdateListener = (id: number) => void;

export interface GameService {
  openSocket(): Promise<void>;

  sendRouteInsertAt(group: Group, atWp: Point, newWp: Point): void;
  sendRouteRemove(group: Group, wp: Point): void;
  sendRouteModify(group: Group, oldWp: Point, newWp: StaticPoint | MovingPoint): void;
  sendSaveMission(): void;
  sendLoadMission(): void;
  sendAddFlight(
    coalition: string,
    country: string,
    location: LatLng,
    airport: number,
    plane: string,
    numberOfPlanes: number
  ): void;
  requestSessionId(): void;
  sendUnitLoadoutUpdate(
    unit: Unit,
    pylons: Dictionary<string>,
    chaff: number,
    flare: number,
    fuel: number,
    gun: number
  ): void;
  sendSessionDataUpdate(sessionId: number, sessionData: SessionData): void;

  getMission(): Promise<Mission>;
  getSessions(): Promise<Sessions>;
  getMapToken(): Promise<string>;
  authAdminPassword(password: string): Promise<boolean>;

  registerForMissionUpdates(listener: MissionUpdateListener): string;
  unregisterMissionUpdateListener(id: string): void;

  registerForSessionsUpdate(listener: SessionsUpdateListener): string;
  unregisterSessionsUpdateListener(id: string): void;

  registerForSessionIdUpdate(listener: SessionIdUpdateListener): string;
  unregisterSessionIdUpdateListener(id: string): void;
}

let socket: WebSocket | null = null;
const missionUpdateListeners: Dictionary<MissionUpdateListener> = {};
const sessionsUpdateListeners: Dictionary<SessionsUpdateListener> = {};
const SessionIdUpdateListeners: Dictionary<SessionIdUpdateListener> = {};

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

async function getSessions(): Promise<Sessions> {
  try {
    const response = await fetch('/game/sessions');
    const sessions = (await response.json()) as Sessions;
    return sessions;
  } catch (error) {
    console.error(`Couldn't fetch sessions`, error);
    return {};
  }
}

async function getMapToken(): Promise<string> {
  try {
    const response = await fetch('/game/map_token');
    const mapToken = await response.text();
    return mapToken;
  } catch (error) {
    console.error(`Couldn't fetch mapToken`, error);
    return '';
  }
}

async function authAdminPassword(password: string): Promise<boolean> {
  try {
    const response = await fetch(`/game/auth_admin/${password}`);
    const result = await response.text();
    return result === 'true';
  } catch (error) {
    console.error(`Couldn't fetch mapToken`, error);
    return false;
  }
}

function receiveUpdateMessage(event: any) {
  const message = JSON.parse(event.data);
  if (message.key === 'mission_updated') {
    Object.keys(missionUpdateListeners).forEach(key => missionUpdateListeners[key](message.value));
  } else if (message.key === 'sessionid') {
    Object.keys(SessionIdUpdateListeners).forEach(key => SessionIdUpdateListeners[key](message.value));
  } else if (message.key === 'sessions_updated') {
    Object.keys(sessionsUpdateListeners).forEach(key => sessionsUpdateListeners[key](message.value));
  }
}

async function openSocket(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL('/ws/message', window.location.href);
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

function sendRouteModify(group: Group, oldWp: Point, newWp: StaticPoint | MovingPoint): void {
  sendMessage('group_route_modify', {
    ...pick(group, ['id']),
    old: pick(oldWp, ['lat', 'lon']),
    new: newWp
  });
}

function sendSaveMission(): void {
  sendMessage('save_mission', '');
}

function sendAddFlight(
  coalition: string,
  country: string,
  location: LatLng,
  airport: number,
  plane: string,
  numberOfPlanes: number
): void {
  sendMessage('add_flight', {
    coalition: coalition,
    country: country,
    location: { lat: location.lat, lon: location.lng },
    airport: airport,
    plane: plane,
    number_of_planes: numberOfPlanes
  });
}

function requestSessionId(): void {
  sendMessage('request_session_id', {});
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
    pylons: Object.keys(pylons)
      .map(k => {
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

function sendSessionDataUpdate(sessionId: number, sessionData: SessionData): void {
  sendMessage('session_data_update', {
    id: sessionId,
    session_data: sessionData
  });
}

function registerForMissionUpdates(listener: MissionUpdateListener): string {
  const id = uuidv4();
  missionUpdateListeners[id] = listener;
  return id;
}

function unregisterMissionUpdateListener(id: string): void {
  if (missionUpdateListeners[id]) {
    delete missionUpdateListeners[id];
  }
}

function registerForSessionsUpdate(listener: SessionsUpdateListener): string {
  const id = uuidv4();
  sessionsUpdateListeners[id] = listener;
  return id;
}

function unregisterSessionsUpdateListener(id: string): void {
  if (sessionsUpdateListeners[id]) {
    delete sessionsUpdateListeners[id];
  }
}

function registerForSessionIdUpdate(listener: SessionIdUpdateListener): string {
  const id = uuidv4();
  SessionIdUpdateListeners[id] = listener;
  return id;
}

function unregisterSessionIdUpdateListener(id: string): void {
  if (SessionIdUpdateListeners[id]) {
    delete SessionIdUpdateListeners[id];
  }
}

export const gameService: GameService = {
  openSocket,
  sendRouteInsertAt,
  sendRouteRemove,
  sendRouteModify,
  sendUnitLoadoutUpdate,
  sendSessionDataUpdate,
  sendSaveMission,
  sendLoadMission,
  sendAddFlight,
  requestSessionId,
  getMission,
  getSessions,
  getMapToken,
  authAdminPassword,
  registerForMissionUpdates,
  unregisterMissionUpdateListener,
  registerForSessionsUpdate,
  unregisterSessionsUpdateListener,
  registerForSessionIdUpdate,
  unregisterSessionIdUpdateListener
};
