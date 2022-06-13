import './Version.css';

import React from 'react';
import VersionJson from '../../data/version.json';

export function Version() {
  const version = VersionJson.version;

  return (
    <div className="Version">
      <span>version: {version}</span>
    </div>
  );
}
