import './Version.css';

import React from 'react';
import * as VersionJson from '../../data/version.json';

export function Version() {
  const version = (VersionJson as any).version;

  return (
    <div className="Version">
      <span>version: {version}</span>
    </div>
  );
}
