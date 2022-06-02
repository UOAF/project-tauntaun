import { useState } from 'react';
import { createContainer } from 'unstated-next';
import { gameService } from '../services';
import { Basemaps } from "esri-leaflet";

export interface MapState {
  showUnits: boolean;
  showThreatRings: boolean;
  showFriendlyThreatRings: boolean;
  showOtherFlightPlans: boolean;
  showOtherWpNames: boolean;
  showAIFlightPlans: boolean;
  showAllGroups: boolean;
  showLegend: boolean;
  showRadarRings: boolean;
  showFriendlyRadarRings: boolean;
  hideAllHostileUnits: boolean; // Temporary for potato PCs until clustering is implemented
  mapType: Basemaps;
  showRuler: boolean;
}

export const defaultState: MapState = {
  showUnits: false,
  showThreatRings: true,
  showFriendlyThreatRings: false,
  showOtherFlightPlans: true,
  showOtherWpNames: false,
  showAIFlightPlans: false,
  showAllGroups: false,
  showLegend: true,
  showRadarRings: false,
  showFriendlyRadarRings: false,
  hideAllHostileUnits: false,
  mapType: 'Topographic',
  showRuler: false
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

  const setShowFriendlyThreatRings = (showFriendlyThreatRings: boolean) => {
    setState(state => ({
      ...state,
      showFriendlyThreatRings: showFriendlyThreatRings
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

  const setMapType = (mapType: Basemaps) => {
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

  const setShowRadarRings = (showRadarRings: boolean) => {
    setState(state => ({
      ...state,
      showRadarRings: showRadarRings
    }));
  };

  const setShowFriendlyRadarRings = (showFriendlyRadarRings: boolean) => {
    setState(state => ({
      ...state,
      showFriendlyRadarRings: showFriendlyRadarRings
    }));
  };

  const setShowRuler = (showRuler: boolean) => {
    setState(state => ({
      ...state,
      showRuler: showRuler
    }));
  };

  return {
    ...state,
    setShowUnits,
    setShowThreatRings,
    setShowFriendlyThreatRings,
    setShowOtherFlightPlans,
    setShowOtherWpNames,
    setShowAIFlightPlans,
    setShowAllGroups,
    setMapType,
    setShowLegend,
    setHideAllHostileUnits,
    setShowRadarRings,
    setShowFriendlyRadarRings,
    setShowRuler
  };
}

export const MapStateContainer = createContainer(useMapState);
