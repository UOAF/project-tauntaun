import React, { useMemo } from 'react';

import { omit } from 'lodash';
import { SidcMarker } from './SidcMarker';
import { SidcMarkerProps } from './SidcMarker';
import { setSidcCoalition, calcAffiliation } from '../../../../models/dcs_util';
import * as DcsStaticRawJson from '../../../../data/dcs_static.json';
import { DcsStaticData } from '../../../../models';
import { CoalitionContext } from '..';

export type DcsSidcMarkerProps = SidcMarkerProps & {
  type?: string;
};

export function DcsSidcMarker(props: DcsSidcMarkerProps) {
  const DcsStatic = (DcsStaticRawJson as any).default as DcsStaticData;

  const { sessionCoalition, groupCoalition } = React.useContext(CoalitionContext);

  const { type } = props;

  const sidc = useMemo(
    () =>
      type && Object.keys(DcsStatic.sidc).includes(type)
        ? setSidcCoalition(DcsStatic.sidc[type], calcAffiliation(sessionCoalition, groupCoalition))
        : 'SOSP--------',
    [type] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return <SidcMarker {...omit(props, 'type')} sidc={sidc} />;
}
