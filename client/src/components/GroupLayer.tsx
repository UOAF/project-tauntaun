import React from 'react';

import { Group, AppStateContainer } from '../models';
import { GroupRoute, GroupMarker } from '.';


export type GroupLayerProps = {
  groups: Group[];
  selectedGroupId: number | undefined;
};

export function GroupLayer(props: GroupLayerProps) {
  const appState = AppStateContainer.useContainer();
  
  const { groups, selectedGroupId } = props;  

  const isUnderway = (group: Group): boolean => {     
    return group.points[0].action === 'PointAction.TurningPoint';
  };

  const toggleGroupSelection = (group: Group): void => {    
    console.info(`selecting group`, group);

    if (selectedGroupId === undefined) {
      appState.selectGroup(group); 
    } if (selectedGroupId === group.id){
      appState.selectGroup(undefined);
    } else {
      appState.selectGroup(group); 
    }   
  };

  return (
    <div>
    {groups.filter(group => isUnderway(group))
      .map(group => (
        <GroupMarker key={"group" + group.id} group={group} toggleGroupSelection={toggleGroupSelection} />        
      ))}
    {groups.filter(group => group.id === selectedGroupId)
      .map(group => (
        <GroupRoute key={"groupRoute" + group.id} group={group} />
      ))}      
    </div>
  );  
}
