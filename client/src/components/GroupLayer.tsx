import React from 'react';

import { Group } from '../models';
import { GroupRoute, GroupMarker } from '.';


export type GroupLayerProps = {
  groups: Group[];
  displayRouteForGroup: number | undefined;  
  groupMarkerOnClick?: (group: Group) => void
};

export function GroupLayer(props: GroupLayerProps) { 
  const { groups, displayRouteForGroup, groupMarkerOnClick } = props;  

  return (        
    <div>      
    {groups.map(group => (
          <GroupMarker key={"group" + group.id} group={group} groupMarkerOnClick={groupMarkerOnClick}/>
      ))}       
    {groups.filter(group => group.id === displayRouteForGroup)
      .map(group => (
        <GroupRoute key={"groupRoute" + group.id} group={group} />
      ))}            
    </div>
  );  
}
