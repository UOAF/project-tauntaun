import { createContext } from 'react';
import { GroupClickEventType } from '../types/common';

export type ModeContextType = {
  groupOnClick?: (event: GroupClickEventType) => void;
  selectedGroupId?: number;
  selectedUnitId?: number;
};

export const ModeContext = createContext({} as ModeContextType); // TODO ?
