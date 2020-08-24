import { Dictionary } from './util';

export type SessionData = {
  name: string;
  selected_unit_id: number;
};

export type Sessions = Dictionary<SessionData>;
