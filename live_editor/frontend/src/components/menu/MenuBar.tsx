import './MenuBar.css';

import React from 'react';
import { AppStateContainer } from '../../models';
import { AdminMenuBar } from './AdminMenuBar';
import { Foldable } from '../ui/Foldable';
import { UserMenuBar } from './UserMenuBar';

export function MenuBar() {
  const { adminMode } = AppStateContainer.useContainer();

  return (
    <div className="Menubar">
      <Foldable>
        {adminMode && (
          <div>
            <AdminMenuBar />
          </div>
        )}
        <UserMenuBar />
      </Foldable>
    </div>
  );
}
