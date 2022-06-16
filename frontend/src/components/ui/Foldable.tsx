import React, { useState, MouseEvent } from 'react';

export type FoldableProps = {
  text?: string;
  onContextMenu?: () => void;
};

export function Foldable(props: React.PropsWithChildren<FoldableProps>) {
  const { text, children, onContextMenu } = props;
  const [fold, setFold] = useState(true);

  const foldText = fold ? '>' : '<';
  const buttonText = `${text ? text : ''}${text ? ' ' : ''}${foldText}`;

  const contextMenuProxy = (event: MouseEvent) => {
    onContextMenu?.();
    event.preventDefault();
  };

  return (
    <React.Fragment>
      <button onClick={() => setFold(!fold)} onContextMenu={contextMenuProxy}>
        {buttonText}
      </button>
      {!fold && children}
    </React.Fragment>
  );
}
