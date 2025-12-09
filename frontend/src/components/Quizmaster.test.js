import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Quizmaster from './Quizmaster';

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  const mockSocket = {
    on: jest.fn(),
    emit: jest.fn(),
    off: jest.fn(),
  };
  return jest.fn(() => mockSocket);
});

// Mock fetch
global.fetch = jest.fn();

describe('Quizmaster Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    
    // Mock API responses
    fetch.mockImplementation((url) => {
      if (url.includes('/api/questions')) {
        return Promise.resolve({
          json: () => Promise.resolve([
            {
              id: 1,
              question: "Test question 1?",
              options: ["A", "B", "C", "D"],
              correctAnswer: 1
            },
            {
              id: 2,
              question: "Test question 2?",
              options: ["W", "X", "Y", "Z"],
              correctAnswer: 0
            }
          ])
        });
      }
      if (url.includes('/api/team-urls')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            team1: 'http://localhost/team/token1',
            team2: 'http://localhost/team/token2',
          })
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  test('renders Quizmaster title', () => {
    render(
      <BrowserRouter>
        <Quizmaster />
      </BrowserRouter>
    );
    expect(screen.getByText(/Question Control/i)).toBeInTheDocument();
  });

  test('fetches questions on mount', async () => {
    render(
      <BrowserRouter>
        <Quizmaster />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/questions'));
    });
  });

  test('fetches team URLs on mount', async () => {
    render(
      <BrowserRouter>
        <Quizmaster />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/team-urls'));
    });
  });

  test('displays leaderboard section', () => {
    render(
      <BrowserRouter>
        <Quizmaster />
      </BrowserRouter>
    );
    expect(screen.getByText(/Leaderboard/i)).toBeInTheDocument();
  });
});
