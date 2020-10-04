import { createContext } from 'react';
import { Group } from '../models';

export type ModeContextType = {
  groupOnClick?: (group: Group, event: any) => void;
  selectedGroupId?: number;
  selectedUnitId?: number;
};

export type MapContextType = {
  map: any;
};

export const ModeContext = createContext({} as ModeContextType); // TODO ?
export const MapContext = createContext({} as MapContextType); // TODO rename LeafletMapContext
