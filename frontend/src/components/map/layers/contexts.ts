import { createContext } from 'react';

export type ColorContextType = {
  color: string;
  opacity: number;
  dashArray?: string;
};

export const ColorContext = createContext({} as ColorContextType);
export const CategoryContext = createContext('');
