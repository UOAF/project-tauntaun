import { Dictionary } from './util';

export type SessionData = {
  name: string;
  selected_unit_id: number;
  coalition: string;
};

export type Sessions = Dictionary<SessionData>;
