import React from 'react';

import { Group } from '../models';
import { GroupRoute, GroupMarker, ModeContext } from '.';

export type GroupLayerProps = {
  groups: Group[];
};

export function GroupLayer(props: GroupLayerProps) {
  const { groups } = props;

  const {groupMarkerOnClick, selectedGroupId } = React.useContext(ModeContext);

  return (
    <div>
      {groups.map(group => (
        <GroupMarker key={'group' + group.id} group={group} groupMarkerOnClick={groupMarkerOnClick} />
      ))}
      {selectedGroupId && groups
        .filter(group => group.id === selectedGroupId)
        .map(group => (
          <GroupRoute key={'groupRoute' + group.id} group={group} />
        ))}
    </div>
  );
}
