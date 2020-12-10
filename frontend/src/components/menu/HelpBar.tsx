import './HelpBar.css';

import React from 'react';

export function HelpBar() {
  return (
    <div className="HelpBar">
      <a className="HelpBarLink" href="https://github.com/UOAF/project-tauntaun/wiki" target="_blank" rel="noreferrer">
        Help
      </a>
      <span className="Spacer" />
      <a
        className="HelpBarLink"
        href="https://github.com/UOAF/project-tauntaun/issues"
        target="_blank"
        rel="noreferrer"
      >
        Report bug
      </a>
    </div>
  );
}
