import './Legend.css';

import React from 'react';
import { LegendContext } from './contexts';

export function Legend() {
  const { legends } = React.useContext(LegendContext);

  return (
    <div className="Legends">
      {legends.map((l, i) => (
        <div key={`legends${i}`} className="Legend">
          <span className="Dot" style={{ '--color': l.color } as React.CSSProperties} />
          <span style={{ fontWeight: l.bold ? 'bold' : 'normal' } as React.CSSProperties}>{l.text}</span>
        </div>
      ))}
    </div>
  );
}
