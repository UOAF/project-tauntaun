import React from 'react';
import { render } from '@testing-library/react';

import App from './App';

test('renders campaign map', () => {
  const { getByTestId } = render(<App />);
  const map = getByTestId('campaign-map');
  expect(map).toBeInTheDocument();
});
