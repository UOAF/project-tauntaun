import React, { useState } from 'react';
import { EmptyPropWithChildren } from '../common';

export function Foldable(props: EmptyPropWithChildren) {
  const [fold, setFold] = useState(true);
  const { children } = props;

  return (
    <React.Fragment>
      <div>
        <button onClick={() => setFold(!fold)}>{fold ? '>' : '<'}</button>
      </div>
      {!fold && children}
    </React.Fragment>
  );
}
