import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NavBar } from '../components/NavBar';

describe('NavBar', () => {
  it('renders the component', () => {
    const setViewMock = vi.fn(); // モック関数を作成
    render(<NavBar currentView="home" setView={setViewMock} />); // propsを渡す
    // Add assertions here based on the content of your NavBar component
    // For example, if your NavBar has a title or specific links:
    // expect(screen.getByText('Your App Title')).toBeInTheDocument();
    // expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();

    // Add snapshot test
    expect(render(<NavBar currentView="home" setView={setViewMock} />).container).toMatchSnapshot();
  });
});
