import React from 'react';
import { LegendContext } from './App';

export function Legend() {
  const legendContext = React.useContext(LegendContext);

  return (
    <div className="Legends">
      {legendContext.legends.map(l => (
        <div className="Legend">
          <span className="Dot" style={{ '--color': l.color } as React.CSSProperties} />
          {l.text}
        </div>
      ))}
    </div>
  );
}
