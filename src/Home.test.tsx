import { render, screen } from '@testing-library/react';
import Home from './Home';

test('renders label caption', () => {
  render(<Home />);
  const labelElement = screen.getByText(/地図 XML ファイル（または .zip ファイル）をここにドラッグ＆ドロップしてください。/i);
  expect(labelElement).toBeInTheDocument();
});
