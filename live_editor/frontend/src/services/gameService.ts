import { pick } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { Dictionary, Point, Mission, Group, emptyMission, MovingPoint, Unit, StaticPoint } from '../models';
import { LatLng } from 'leaflet';

import { Sessions, SessionData } from '../models/sessionData';
import { inflate } from 'zlib';
import { promisify } from 'util';
import { DcsStaticData, emptyDcsStaticData } from '../models/dcs_static';

export type MissionUpdateListener = (updatedMission: Mission) => void;
export type SessionsUpdateListener = (updatedSessions: Sessions) => void;
export type SessionIdUpdateListener = (id: number) => void;
export type GenericUpdateListener = (message: any) => void;
export type OnCloseListener = (ev: CloseEvent) => void;

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
  sendSetBullseye(coalition: string, bullseye: LatLng): void;
  sendSessionDataUpdate(sessionId: number, sessionData: SessionData): void;

  getMission(): Promise<Mission>;
  getSessions(): Promise<Sessions>;
  getMapToken(): Promise<string>;
  getStaticData(): Promise<DcsStaticData>;
  authAdminPassword(password: string): Promise<boolean>;

  registerForMissionUpdates(listener: MissionUpdateListener): string;
  unregisterMissionUpdateListener(id: string): void;

  registerForSessionsUpdate(listener: SessionsUpdateListener): string;
  unregisterSessionsUpdateListener(id: string): void;

  registerForSessionIdUpdate(listener: SessionIdUpdateListener): string;
  unregisterSessionIdUpdateListener(id: string): void;

  registerForGenericUpdates(listener: GenericUpdateListener): string;
  unregisterGenericUpdateListener(id: string): void;

  registerForOnClose(listener: GenericUpdateListener): string;
  unregisterOnCloseListener(id: string): void;
}

let socket: WebSocket | null = null;
const missionUpdateListeners: Dictionary<MissionUpdateListener> = {};
const sessionsUpdateListeners: Dictionary<SessionsUpdateListener> = {};
const sessionIdUpdateListeners: Dictionary<SessionIdUpdateListener> = {};
const genericUpdateListeners: Dictionary<GenericUpdateListener> = {};
const onCloseListeners: Dictionary<OnCloseListener> = {};
let time_start: number | null = null;

function sendMessage(name: string, value: any) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('socket not open');
    return;
  }

  time_start = performance.now();
  socket.send(JSON.stringify({ key: name, value: value }));
}

async function getMission(): Promise<Mission> {
  try {
    const response = await fetch('/game/mission');
    if (!response.ok) {
      throw new Error('Response is not OK');
    }

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
    if (!response.ok) {
      throw new Error('Response is not OK');
    }

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
    if (!response.ok) {
      throw new Error('Response is not OK');
    }

    const mapToken = await response.text();
    return mapToken;
  } catch (error) {
    console.error(`Couldn't fetch mapToken`, error);
    return '';
  }
}

async function getStaticData(): Promise<DcsStaticData> {
  try {
    const response = await fetch('/game/static_data');
    if (!response.ok) {
      throw new Error('Response is not OK');
    }

    const staticData = (await response.json()) as DcsStaticData;
    return staticData;
  } catch (error) {
    console.error(`Couldn't fetch static_data`, error);
    return emptyDcsStaticData as DcsStaticData;
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

async function receiveUpdateMessage(event: any) {
  const time_end = performance.now();
  if (time_start !== null) {
    console.log(`Roundtrip: ${time_end - time_start}ms`);
    time_start = null;
  }

  const data = Buffer.from(Buffer.from(event.data, 'base64'), 4);
  const do_unzip = promisify(inflate);
  const unzipped_data = await do_unzip(data);

  const message = JSON.parse((unzipped_data as unknown) as string);
  if (message.key === 'mission_updated') {
    Object.keys(missionUpdateListeners).forEach(key => missionUpdateListeners[key](message.value));
  } else if (message.key === 'sessionid') {
    Object.keys(sessionIdUpdateListeners).forEach(key => sessionIdUpdateListeners[key](message.value));
  } else if (message.key === 'sessions_updated') {
    Object.keys(sessionsUpdateListeners).forEach(key => sessionsUpdateListeners[key](message.value));
  } else {
    Object.keys(genericUpdateListeners).forEach(key => genericUpdateListeners[key](message));
  }
}

async function openSocket(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL('/ws/message', window.location.href);
      url.protocol = url.protocol.replace('http', 'ws');
      url.port = '8080';
      socket = new WebSocket(url.toString());
      socket.binaryType = 'arraybuffer';
      socket.onopen = () => resolve();
      socket.onerror = () => reject();
      socket.onmessage = receiveUpdateMessage;
      socket.onclose = (ev: CloseEvent) => {
        Object.keys(onCloseListeners).forEach(key => onCloseListeners[key](ev));
      };
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
  sendMessage('unit_loadout_update', {
    id: unit.id,
    pylons: pylons,
    chaff: chaff,
    flare: flare,
    gun: gun,
    fuel: fuel
  });
}

function sendSetBullseye(coalition: string, bullseye: LatLng) {
  sendMessage('set_bullseye', {
    coalition: coalition,
    bullseye: { lat: bullseye.lat, lon: bullseye.lng }
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
  sessionIdUpdateListeners[id] = listener;
  return id;
}

function unregisterSessionIdUpdateListener(id: string): void {
  if (sessionIdUpdateListeners[id]) {
    delete sessionIdUpdateListeners[id];
  }
}

function registerForGenericUpdates(listener: GenericUpdateListener): string {
  const id = uuidv4();
  genericUpdateListeners[id] = listener;
  return id;
}

function unregisterGenericUpdateListener(id: string): void {
  if (genericUpdateListeners[id]) {
    delete genericUpdateListeners[id];
  }
}

function registerForOnClose(listener: OnCloseListener): string {
  const id = uuidv4();
  onCloseListeners[id] = listener;
  return id;
}

function unregisterOnCloseListener(id: string): void {
  if (onCloseListeners[id]) {
    delete onCloseListeners[id];
  }
}

export const gameService: GameService = {
  openSocket,
  sendRouteInsertAt,
  sendRouteRemove,
  sendRouteModify,
  sendUnitLoadoutUpdate,
  sendSetBullseye,
  sendSessionDataUpdate,
  sendSaveMission,
  sendLoadMission,
  sendAddFlight,
  requestSessionId,
  getMission,
  getSessions,
  getMapToken,
  getStaticData,
  authAdminPassword,
  registerForMissionUpdates,
  unregisterMissionUpdateListener,
  registerForSessionsUpdate,
  unregisterSessionsUpdateListener,
  registerForSessionIdUpdate,
  unregisterSessionIdUpdateListener,
  registerForGenericUpdates,
  unregisterGenericUpdateListener,
  registerForOnClose,
  unregisterOnCloseListener
};
