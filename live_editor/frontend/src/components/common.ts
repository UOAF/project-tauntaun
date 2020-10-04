import { Group } from '../models';

export type EmptyProp = {};
export type EmptyPropWithChildren = React.PropsWithChildren<EmptyProp>;

export const isLeadOfFlight = (selectedUnitId: number | undefined, group: Group | undefined) =>
  group && selectedUnitId ? selectedUnitId === group.units[0].id : false;
