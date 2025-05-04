import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Settings } from '../components/Settings';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    button: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
    span: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  },
}));

describe('Settings', () => {
  it('renders the component', () => {
    const onProviderChangeMock = vi.fn();
    const onSyncMock = vi.fn(() => Promise.resolve());

    render(
      <Settings
        cloudProvider="none" // 例として "none" を渡す
        onProviderChange={onProviderChangeMock}
        onSync={onSyncMock}
        syncStatus="synced" // 例として "synced" を渡す
      />
    );

    // Add assertions here based on the content and behavior of Settings
    // For example, check for settings options or input fields:
    // expect(screen.getByLabelText('Cloud Provider')).toBeInTheDocument();

    // Add snapshot test
    expect(render(
      <Settings
        cloudProvider="none"
        onProviderChange={onProviderChangeMock}
        onSync={onSyncMock}
        syncStatus="synced"
      />
    ).container).toMatchSnapshot();
  });
});
