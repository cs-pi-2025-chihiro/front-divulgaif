import { render, screen } from '@testing-library/react';
import App from './App';

// Mock do console para evitar falhas por logs
beforeAll(() => {
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

// Mock do IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

test('renders app without crashing', () => {
  render(<App />);
  // Verifica se o componente principal está presente
  expect(document.querySelector('.App')).toBeInTheDocument();
});
