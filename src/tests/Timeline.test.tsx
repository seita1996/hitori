import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Timeline } from '../components/Timeline';
import { Post } from '../types'; // Post型をインポート

// Mock framer-motion if Timeline uses it
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    // Add mock implementations for motion components used in Timeline if any other than div are used
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, // AnimatePresenceを追加
}));

describe('Timeline', () => {
  it('renders the component with posts', () => {
    const mockPosts: Post[] = [
      { id: '1', content: 'Test Post 1', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_synced: false },
      { id: '2', content: 'Test Post 2', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_synced: true },
    ];

    render(<Timeline posts={mockPosts} />);

    // Add assertions here based on the content and behavior of Timeline
    // For example, check if post content is displayed:
    // expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    // expect(screen.getByText('Test Post 2')).toBeInTheDocument();

    // Add snapshot test
    expect(render(<Timeline posts={mockPosts} />).container).toMatchSnapshot();
  });

  it('renders the component without posts', () => {
    render(<Timeline posts={[]} />);

    // Add assertions for the case with no posts
    // expect(screen.getByText('No posts yet.')).toBeInTheDocument(); // Example

    // Add snapshot test
    expect(render(<Timeline posts={[]} />).container).toMatchSnapshot();
  });
});
