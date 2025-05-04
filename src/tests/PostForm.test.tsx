import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PostForm } from '../components/PostForm';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    span: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
    button: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  },
}));

describe('PostForm', () => {
  it('renders the component', () => {
    const onSubmitMock = vi.fn();
    render(<PostForm onSubmit={onSubmitMock} />);

    // Add assertions here based on the content and behavior of PostForm
    // For example, check for input fields and a submit button:
    // expect(screen.getByPlaceholderText('What's on your mind?')).toBeInTheDocument();
    // expect(screen.getByRole('button', { name: 'Post' })).toBeInTheDocument();

    // Add snapshot test
    expect(render(<PostForm onSubmit={onSubmitMock} />).container).toMatchSnapshot();
  });
});
