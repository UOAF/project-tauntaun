import React from 'react';

import { Group } from '../models';
import { CoalitionContext } from './CoalitionLayer';

import * as DcsStaticRawJson from '../data/dcs_static.json';
import { DcsStaticData } from '../models/dcs_static';
import { SidcMarker } from './SidcMarker';
import { changeSidcCoalition } from '../models/dcs_util';

export type GroupProps = {
  group: Group;
  groupMarkerOnClick?: (group: Group, event: any) => void;
};

export function GroupMarker(props: GroupProps) {
  const DcsStatic = (DcsStaticRawJson as any).default as DcsStaticData;
  
  const { group, groupMarkerOnClick } = props;
  
  const coalition = React.useContext(CoalitionContext);

  const getSidc = () => {
    // https://spatialillusions.com/unitgenerator/
    const unitType = group.units[0].type;
    const sidcFound = Object.keys(DcsStatic.sidc).includes(unitType);    

    if (!sidcFound) return 'SOSP--------';

    const sidc =  DcsStatic.sidc[unitType];
    return changeSidcCoalition(sidc, coalition);
  };

  const sidc = getSidc();

  const { lat, lon: lng } = group.units[0].position;

  const onClick = () => {
    if (groupMarkerOnClick) {
      groupMarkerOnClick(group, {coalition: coalition});
    }
  };

  return (
    <SidcMarker position={{ lat, lng }} sidc={sidc} name={group.name} onclick={onClick} />
  );
}
