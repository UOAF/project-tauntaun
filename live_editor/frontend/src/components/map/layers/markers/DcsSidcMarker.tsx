import React, { useMemo } from 'react';

import { omit } from 'lodash';
import { SidcMarker } from './SidcMarker';
import { SidcMarkerProps } from './SidcMarker';
import { setSidcCoalition, calcAffiliation } from '../../../../models/dcs_util';
import { CoalitionContext } from '..';
import { DcsStaticDataStateContainer } from '../../../../models';

export type DcsSidcMarkerProps = SidcMarkerProps & {
  type?: string;
};

export function DcsSidcMarker(props: DcsSidcMarkerProps) {
  const { dcsStaticData } = DcsStaticDataStateContainer.useContainer();

  const { sessionCoalition, groupCoalition } = React.useContext(CoalitionContext);

  const { type } = props;

  const sidc = useMemo(
    () =>
      type && Object.keys(dcsStaticData.sidc).includes(type)
        ? setSidcCoalition(dcsStaticData.sidc[type], calcAffiliation(sessionCoalition, groupCoalition))
        : 'SOSP--------',
    [type]
  );

  return <SidcMarker {...omit(props, 'type')} sidc={sidc} />;
}
