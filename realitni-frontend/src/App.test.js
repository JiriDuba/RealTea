import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders ProperTea header', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const headerElement = screen.getByText(/ProperTea/i);
  expect(headerElement).toBeInTheDocument();
});