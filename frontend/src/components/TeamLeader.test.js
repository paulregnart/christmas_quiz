import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import TeamLeader from './TeamLeader';

// Mock socket.io-client
const mockSocket = {
  on: jest.fn(),
  emit: jest.fn(),
  off: jest.fn(),
};

jest.mock('socket.io-client', () => {
  return jest.fn(() => mockSocket);
});

describe('TeamLeader Component', () => {
  beforeEach(() => {
    mockSocket.on.mockClear();
    mockSocket.emit.mockClear();
    mockSocket.off.mockClear();
  });

  test('shows invalid URL message without token', () => {
    render(
      <MemoryRouter initialEntries={['/team/']}>
        <Routes>
          <Route path="/team/:token" element={<TeamLeader />} />
        </Routes>
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Invalid Team URL/i)).toBeInTheDocument();
  });

  test('shows join form with valid token', () => {
    render(
      <MemoryRouter initialEntries={['/team/valid-token-123']}>
        <Routes>
          <Route path="/team/:token" element={<TeamLeader />} />
        </Routes>
      </MemoryRouter>
    );
    
    expect(screen.getByPlaceholderText(/Enter your team name/i)).toBeInTheDocument();
  });

  test('join button calls socket emit', () => {
    render(
      <MemoryRouter initialEntries={['/team/valid-token-123']}>
        <Routes>
          <Route path="/team/:token" element={<TeamLeader />} />
        </Routes>
      </MemoryRouter>
    );
    
    const input = screen.getByPlaceholderText(/Enter your team name/i);
    const button = screen.getByText(/Join Quiz/i);
    
    fireEvent.change(input, { target: { value: 'Test Team' } });
    fireEvent.click(button);
    
    expect(mockSocket.emit).toHaveBeenCalledWith('join-team', {
      token: 'valid-token-123',
      teamName: 'Test Team'
    });
  });

  test('registers socket event listeners on mount', () => {
    render(
      <MemoryRouter initialEntries={['/team/valid-token-123']}>
        <Routes>
          <Route path="/team/:token" element={<TeamLeader />} />
        </Routes>
      </MemoryRouter>
    );
    
    expect(mockSocket.on).toHaveBeenCalledWith('game-state', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('team-joined', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('new-question', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('answers-revealed', expect.any(Function));
  });
});

describe('TeamLeader Answer Submission', () => {
  test('submits answer as index not text', async () => {
    render(
      <MemoryRouter initialEntries={['/team/valid-token-123']}>
        <Routes>
          <Route path="/team/:token" element={<TeamLeader />} />
        </Routes>
      </MemoryRouter>
    );

    // Simulate team joined
    const joinHandler = mockSocket.on.mock.calls.find(call => call[0] === 'team-joined')?.[1];
    if (joinHandler) {
      joinHandler({ teamId: 'team1', teamName: 'Test Team' });
    }

    // Simulate new question
    const questionHandler = mockSocket.on.mock.calls.find(call => call[0] === 'new-question')?.[1];
    if (questionHandler) {
      questionHandler({
        question: 'Test question?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        questionNumber: 1,
        totalQuestions: 15,
        timeLimit: 20
      });
    }

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      // Click first option (index 0)
      fireEvent.click(buttons[0]);
    });

    const submitButton = screen.getByText(/Submit Answer/i);
    fireEvent.click(submitButton);

    // Verify it submits the INDEX (0), not the text "Option A"
    expect(mockSocket.emit).toHaveBeenCalledWith('submit-answer', {
      teamId: 'team1',
      answer: 0 // This should be a number, not "Option A"
    });
  });
});
