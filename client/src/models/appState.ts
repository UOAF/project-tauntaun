import L, { LatLng } from 'leaflet';
import { useState } from 'react';
import { createContainer } from 'unstated-next';

import { Mission, Group, emptyMission, MasterMode, defaultEditGroupMode, EditGroupMode, AddFlightMode } from './';
import { gameService } from '../services';
import { without } from 'lodash';

export interface AppState {
  isInitialized: boolean;
  mission: Mission;
  masterMode: MasterMode;
}

const defaultState: AppState = {
  isInitialized: false,
  mission: emptyMission,
  masterMode: defaultEditGroupMode
};

function useAppState(initialState = defaultState) {
  const [state, setState] = useState(initialState);

  const refreshMission = async (): Promise<void> => {
    const mission = await gameService.getMission()
    setState(state => ({
      ...state,
      mission: mission
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

  const initialize = async (): Promise<void> => {
    try {
      if (state.isInitialized) {
        return;
      }

      (L as any).PM.initialize({ optIn: false });

      gameService.registerForMissionUpdates(onMissionUpdate);
      await gameService.openSocket();
      console.info('update socket connected');

      await refreshMission();
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
        let coalitionKey = "";
        let countryKey = "";
        let groupType = "";

        for (coalitionKey in state.mission.coalition) {        
          const coalition = state.mission.coalition[coalitionKey];
          for (countryKey in coalition.countries) {
            const country = coalition.countries[countryKey];
    
            const possibleGroupCategories = ["helicopter_group", "plane_group", "ship_group", "vehicle_group", "static_group"];
            for (const groupCategoryIndex in possibleGroupCategories) {
              const groupCategoryName = possibleGroupCategories[groupCategoryIndex];
              const groupCategory = country[groupCategoryName] as Array<Group>;
              if (groupCategory && groupCategory.find(g => g.id === group.id)) {
                groupType = groupCategoryName;
                return [coalitionKey, countryKey, groupType];
              }
            };
          }
        }

        return [coalitionKey, countryKey, groupType] ;
      };

      const [coalitionKey, countryKey, groupType] = findGroupLocation();

      if (coalitionKey === "" || countryKey === "" || groupType === "") {
        console.error("updateGroup failed, group not found, Coalition: "  + coalitionKey + ", Country: " + countryKey + ", Group category: " + groupType);
        console.log(group);
        return {...state};
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
                [groupType]: [
                  ...groupsWithout,
                  group
                ]
              }
            }
          }
        }
      }
    }
    });
  }; 

  const setMasterMode = (masterMode: MasterMode) => {
    setState(state => ({
      ...state,
      masterMode: masterMode
    }));
  }

  const selectGroup = (group: Group | undefined) => {
    setState(state => ({
      ...state,
      masterMode: {
        ...state.masterMode,        
        selectedGroupId: group?.id                
      } as EditGroupMode     
    }));
  }

  const setLocation = (location: LatLng | undefined) => {
    setState(state => ({
      ...state,
      masterMode: {
        ...state.masterMode,        
        location: location
      } as AddFlightMode 
    }));
  }

  return { ...state, initialize, refreshMission, updateGroup, setMasterMode, selectGroup, setLocation }; 
}

export const AppStateContainer = createContainer(useAppState);
export type AppStateContainerType = ReturnType<typeof AppStateContainer.useContainer>;