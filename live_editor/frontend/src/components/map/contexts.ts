import { createContext } from 'react';

export type LegendType = {
  color: string;
  text: string;
  bold: boolean;
};

export type LegendContextType = {
  legends: LegendType[];
};

export const defaultColorPalette = ['red', 'black', 'orange', 'blue', 'green', 'brown', 'magenta'];

export const ColorPaletteContext = createContext(defaultColorPalette);
export const LegendContext = createContext({} as LegendContextType);
