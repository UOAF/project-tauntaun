import { useState } from 'react';

export interface MapState {
  showUnits: boolean;
  showThreatRings: boolean;
  showOtherFlightPlans: boolean;
  showOtherWpNames: boolean;
  showAIFlightPlans: boolean;
  showAllGroups: boolean;
  showLegend: boolean;
  hideAllHostileUnits: boolean; // Temporary for potato PCs until clustering is implemented
  mapType: string;
}

export const defaultState: MapState = {
  showUnits: false,
  showThreatRings: true,
  showOtherFlightPlans: true,
  showOtherWpNames: false,
  showAIFlightPlans: false,
  showAllGroups: false,
  showLegend: true,
  hideAllHostileUnits: false,
  mapType: 'mapbox/outdoors-v11'
};

export function useMapState(initialState = defaultState) {
  const [state, setState] = useState(initialState);

  const setShowUnits = (showUnits: boolean) => {
    setState(state => ({
      ...state,
      showUnits: showUnits
    }));
  };

  const setShowThreatRings = (showThreatRings: boolean) => {
    setState(state => ({
      ...state,
      showThreatRings: showThreatRings
    }));
  };

  const setShowOtherFlightPlans = (showOtherFlightPlans: boolean) => {
    setState(state => ({
      ...state,
      showOtherFlightPlans: showOtherFlightPlans
    }));
  };

  const setShowOtherWpNames = (showOtherWpNames: boolean) => {
    setState(state => ({
      ...state,
      showOtherWpNames: showOtherWpNames
    }));
  };

  const setShowAIFlightPlans = (showAIFlightPlans: boolean) => {
    setState(state => ({
      ...state,
      showAIFlightPlans: showAIFlightPlans
    }));
  };

  const setShowAllGroups = (showAllGroups: boolean) => {
    setState(state => ({
      ...state,
      showAllGroups: showAllGroups
    }));
  };

  const setMapType = (mapType: string) => {
    setState(state => ({
      ...state,
      mapType: mapType
    }));
  };

  const setShowLegend = (showLegend: boolean) => {
    setState(state => ({
      ...state,
      showLegend: showLegend
    }));
  };

  const setHideAllHostileUnits = (hideAllHostileUnits: boolean) => {
    setState(state => ({
      ...state,
      hideAllHostileUnits: hideAllHostileUnits
    }));
  };

  return {
    ...state,
    setShowUnits,
    setShowThreatRings,
    setShowOtherFlightPlans,
    setShowOtherWpNames,
    setShowAIFlightPlans,
    setShowAllGroups,
    setMapType,
    setShowLegend,
    setHideAllHostileUnits
  };
}
