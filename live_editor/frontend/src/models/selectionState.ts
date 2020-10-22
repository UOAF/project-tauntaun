import { useState } from 'react';
import { createContainer } from 'unstated-next';

export interface SelectionState {
  selectedGroupId: number | undefined;
  selectedUnitId: number | undefined;
  selectedWaypoint: number | undefined;
}

export const defaultSelectionState: SelectionState = {
  selectedGroupId: undefined,
  selectedWaypoint: undefined,
  selectedUnitId: undefined
};

export function useSelectionState(initialState = defaultSelectionState) {
  const [state, setState] = useState(initialState);

  const selectGroup = (groupId: number | undefined) => {
    setState(state => ({
      ...state,
      selectedGroupId: groupId
    }));
  };

  const selectUnit = (unitId: number | undefined) => {
    setState(state => ({
      ...state,
      selectedUnitId: unitId
    }));
  };

  const selectWaypoint = (id: number | undefined) => {
    setState(state => ({
      ...state,
      selectedWaypoint: id
    }));
  };

  return {
    ...state,
    selectGroup,
    selectUnit,
    selectWaypoint
  };
}

export const SelectionStateContainer = createContainer(useSelectionState);
