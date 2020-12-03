import { Group } from '../models';

export const isLeadOfFlight = (selectedUnitId: number | undefined, group: Group | undefined) =>
  group && selectedUnitId ? selectedUnitId === group.units[0].id : false;
