import { Group } from '../models';

export const isLeadOfFlight = (selectedUnitId: number | undefined, group: Group | undefined): boolean =>
  group && selectedUnitId ? selectedUnitId === group.units[0].id : false;
