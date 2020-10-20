import './MenuBar.css';

import React, { useState } from 'react';
import { AppStateContainer } from '../../models';
import { AdminMenuBar } from './AdminMenuBar';
import { Foldable } from '../ui/Foldable';
import { UserMenuBar } from './UserMenuBar';
import { PasswordForm } from '../forms/PasswordForm';
import { gameService } from '../../services/gameService';
import sha256 from 'js-sha256';

export function MenuBar() {
  const { adminMode, setAdminMode } = AppStateContainer.useContainer();
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const onContextMenu = () => {
    if (adminMode) return;
    setShowPasswordForm(true);
  };

  const onOk = async (password: string) => {
    const isPasswordCorrect = await gameService.authAdminPassword(sha256(password));
    if (isPasswordCorrect) {
      setAdminMode(true);
    }
    setShowPasswordForm(false);
  };

  return (
    <React.Fragment>
      <div className="Menubar">
        <Foldable onContextMenu={onContextMenu}>
          <div>
            {adminMode && (
              <div>
                <AdminMenuBar />
              </div>
            )}
            <UserMenuBar />
          </div>
        </Foldable>
      </div>
      {showPasswordForm && <PasswordForm onOk={onOk} onCancel={() => setShowPasswordForm(false)} />}
    </React.Fragment>
  );
}
