import L, { LatLng } from 'leaflet';
import { useState } from 'react';
import { createContainer } from 'unstated-next';

import { Mission, Group, emptyMission, MasterMode, defaultEditGroupMode, EditGroupMode, AddFlightMode } from './';
import { gameService } from '../services';
import { without } from 'lodash';
import { Sessions } from './sessionData';
import wu from 'wu';
import { getGroups } from './dcs_util';

export interface AppState {
  isInitialized: boolean;
  mission: Mission;
  masterMode: MasterMode;
  showUnits: boolean;
  showThreatRings: boolean;
  sessionId: number;
  sessions: Sessions;
  loadoutEditorVisibility: boolean;
  adminMode: boolean;
  showOtherFlightPlans: boolean;
  showOtherWpNames: boolean;
  showAIFlightPlans: boolean;
  showAllGroups: boolean;
}

const defaultState: AppState = {
  isInitialized: false,
  mission: emptyMission,
  masterMode: defaultEditGroupMode,
  showUnits: false,
  showThreatRings: true,
  sessionId: -1,
  sessions: {},
  loadoutEditorVisibility: false,
  adminMode: false,
  showOtherFlightPlans: true,
  showOtherWpNames: false,
  showAIFlightPlans: false,
  showAllGroups: false
};

function useAppState(initialState = defaultState) {
  const [state, setState] = useState(initialState);

  const refreshMission = async (): Promise<void> => {
    const mission = await gameService.getMission();
    setState(state => ({
      ...state,
      mission: mission
    }));
  };

  const refreshSessions = async (): Promise<void> => {
    const sessions = await gameService.getSessions();
    setState(state => ({
      ...state,
      sessions: sessions
    }));
  };

  const onMissionUpdate = (updatedMission: Mission) => {
    setState(state => {
      return {
        ...state,
        mission: updatedMission
      };
    });

    console.info(`got mission update`);
  };

  const onSessionIdUpdateReceived = (sessionId: number) => {
    setState(state => {
      return {
        ...state,
        sessionId: sessionId
      };
    });

    console.info(`got registration data`);
  };

  const onSessionsUpdateReceived = (sessions: Sessions) => {
    setState(state => {
      // TODO this should not be here or not like this, hack for mvp
      const sessionData = sessions[state.sessionId];
      const editGroupMode = state.masterMode as EditGroupMode;
      const selected_unit_id = sessionData.selected_unit_id;
      if (
        sessionData &&
        selected_unit_id !== -1 &&
        editGroupMode &&
        (editGroupMode.selectedUnitId === undefined || editGroupMode.selectedUnitId !== selected_unit_id)
      ) {
        const group = wu(getGroups(state.mission)).find(
          g => g.units.find(u => u.id === selected_unit_id) !== undefined
        );

        if (group) {
          if (group.id !== editGroupMode.selectedGroupId) {
            editGroupMode.selectedGroupId = group.id;
          }

          editGroupMode.selectedUnitId = selected_unit_id;
        }

        return {
          ...state,
          sessions: sessions,
          masterMode: {
            ...state.masterMode,
            selectedGroupId: editGroupMode.selectedGroupId,
            selectedUnitId: editGroupMode.selectedUnitId
          } as EditGroupMode
        };
      }

      return {
        ...state,
        sessions: sessions
      };
    });

    console.info(`got sessions update`);
  };

  const initialize = async (): Promise<void> => {
    try {
      if (state.isInitialized) {
        return;
      }

      (L as any).PM.initialize({ optIn: false });

      gameService.registerForMissionUpdates(onMissionUpdate);
      gameService.registerForSessionIdUpdate(onSessionIdUpdateReceived);
      gameService.registerForSessionsUpdate(onSessionsUpdateReceived);
      await gameService.openSocket();
      console.info('update socket connected');

      await refreshMission();
      await refreshSessions();

      setState(state => ({
        ...state,
        isInitialized: true
      }));
      console.info('app state initialized');
    } catch (error) {
      console.error(`couldn't initialize appState`, error);
      throw error;
    }
  };

  const updateGroup = (group: Group) => {
    // Note: Group id is unique per mission
    setState(state => {
      const findGroupLocation = () => {
        let coalitionKey = '';
        let countryKey = '';
        let groupType = '';

        for (coalitionKey in state.mission.coalition) {
          const coalition = state.mission.coalition[coalitionKey];
          for (countryKey in coalition.countries) {
            const country = coalition.countries[countryKey];

            const possibleGroupCategories = [
              'helicopter_group',
              'plane_group',
              'ship_group',
              'vehicle_group',
              'static_group'
            ];
            for (const groupCategoryIndex in possibleGroupCategories) {
              const groupCategoryName = possibleGroupCategories[groupCategoryIndex];
              const groupCategory = country[groupCategoryName] as Array<Group>;
              if (groupCategory && groupCategory.find(g => g.id === group.id)) {
                groupType = groupCategoryName;
                return [coalitionKey, countryKey, groupType];
              }
            }
          }
        }

        return [coalitionKey, countryKey, groupType];
      };

      const [coalitionKey, countryKey, groupType] = findGroupLocation();

      if (coalitionKey === '' || countryKey === '' || groupType === '') {
        console.error(
          'updateGroup failed, group not found, Coalition: ' +
            coalitionKey +
            ', Country: ' +
            countryKey +
            ', Group category: ' +
            groupType
        );
        console.log(group);
        return { ...state };
      }

      const groups = state.mission.coalition[coalitionKey].countries[countryKey][groupType] as Array<Group>;
      const oldUnit = groups.find(u => u.id === group.id);
      const groupsWithout = oldUnit ? without(groups, oldUnit) : groups;

      return {
        ...state,
        mission: {
          ...state.mission,
          coalition: {
            ...state.mission.coalition,
            [coalitionKey]: {
              ...state.mission.coalition[coalitionKey],
              countries: {
                ...state.mission.coalition[coalitionKey].countries,
                [countryKey]: {
                  ...state.mission.coalition[coalitionKey].countries[countryKey],
                  [groupType]: [...groupsWithout, group]
                }
              }
            }
          }
        }
      };
    });
  };

  const setMasterMode = (masterMode: MasterMode) => {
    setState(state => ({
      ...state,
      masterMode: masterMode
    }));
  };

  const selectGroup = (groupId: number | undefined) => {
    setState(state => ({
      ...state,
      masterMode: {
        ...state.masterMode,
        selectedGroupId: groupId
      } as EditGroupMode
    }));
  };

  const selectUnit = (unitId: number | undefined) => {
    setState(state => ({
      ...state,
      masterMode: {
        ...state.masterMode,
        selectedUnitId: unitId
      } as EditGroupMode
    }));
  };

  const selectWaypoint = (id: number | undefined) => {
    setState(state => ({
      ...state,
      masterMode: {
        ...state.masterMode,
        selectedWaypoint: id
      } as EditGroupMode
    }));
  };

  const setLocation = (location: LatLng | undefined) => {
    setState(state => ({
      ...state,
      masterMode: {
        ...state.masterMode,
        location: location
      } as AddFlightMode
    }));
  };

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

  const setAdminMode = (adminMode: boolean) => {
    setState(state => ({
      ...state,
      adminMode: adminMode
    }));
  };

  const setLoadoutEditorVisibility = (visible: boolean) => {
    setState(state => ({
      ...state,
      loadoutEditorVisibility: visible
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

  return {
    ...state,
    initialize,
    refreshMission,
    updateGroup,
    setMasterMode,
    selectGroup,
    selectWaypoint,
    setLocation,
    selectUnit,
    setShowUnits,
    setShowThreatRings,
    setAdminMode,
    setLoadoutEditorVisibility,
    setShowOtherFlightPlans,
    setShowOtherWpNames,
    setShowAIFlightPlans,
    setShowAllGroups
  };
}

export const AppStateContainer = createContainer(useAppState);
export type AppStateContainerType = ReturnType<typeof AppStateContainer.useContainer>;
