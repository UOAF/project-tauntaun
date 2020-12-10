import '../Window.css';

import React, { useState } from 'react';
import { Input } from '@material-ui/core';

export interface PasswordFormProps {
  onOk: (password: string) => void;
  onCancel: () => void;
}

export function PasswordForm(props: PasswordFormProps) {
  const { onOk, onCancel } = props;
  const [password, setPassword] = useState('');

  return (
    <div className="Popup">
      <p>Enter password</p>
      <Input
        type="password"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
      />
      <div>
        <button onClick={() => onOk(password)}>OK</button>
        <button onClick={() => onCancel()}>Cancel</button>
      </div>
    </div>
  );
}
