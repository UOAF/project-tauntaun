import React from 'react';

import { omit } from 'lodash';
import { SidcMarker } from './SidcMarker';
import { SidcMarkerProps } from './SidcMarker';
import { changeSidcCoalition } from '../models/dcs_util';
import * as DcsStaticRawJson from '../data/dcs_static.json';
import { CoalitionContext } from './CoalitionLayer';
import { DcsStaticData } from '../models';

export type DcsSidcMarkerProps = SidcMarkerProps & {
  type?: string;
  // TODO get rid of sidc somehow
};

export function DcsSidcMarker(props: DcsSidcMarkerProps) {
  const DcsStatic = (DcsStaticRawJson as any).default as DcsStaticData;
  const { type } = props;

  const coalition = React.useContext(CoalitionContext);

  let sidc = 'SOSP--------';
  if (type) {
    const sidcFound = Object.keys(DcsStatic.sidc).includes(type);
    sidc = sidcFound ? changeSidcCoalition(DcsStatic.sidc[type], coalition) : sidc;
  }

  return <SidcMarker {...omit(props, 'type')} sidc={sidc} />;
}
