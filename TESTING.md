# Testing Guide

## Overview

This project includes comprehensive tests for both backend and frontend to ensure game functionality works correctly. Tests validate critical features like answer validation, Socket.IO communication, REST API endpoints, and component behavior.

## Backend Tests

### What's Tested

- **REST API Endpoints**: `/api/questions`, `/api/team-urls`, `/api/game-state`, `/api/start-question`
- **Game Logic**: Answer validation (index-based), question format, score updates
- **Socket.IO**: Connection handling, event emission, real-time communication
- **Data Integrity**: Correct answer indices (0-3), option counts, question structure

### Running Backend Tests

```bash
cd backend

# Install test dependencies (first time only)
npm install

# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm test -- --coverage
```

### Test Files

- `backend/server.test.js` - Main test suite
- `backend/jest.config.js` - Jest configuration

### Key Test Cases

1. **Answer Index Validation**: Ensures `correctAnswer` is a number (0-3), not text
2. **REST API Health**: Validates all endpoints return correct data structures
3. **Socket.IO Events**: Tests real-time event emission and handling
4. **Question Format**: Verifies all questions have 4 options and valid indices

## Frontend Tests

### What's Tested

- **Quizmaster Component**: Question control, leaderboard display, API fetching
- **TeamLeader Component**: Answer submission, result display, socket communication
- **Answer Submission**: Validates teams submit answer **index** (0-3) not text
- **Component Lifecycle**: Socket event registration, state management

### Running Frontend Tests

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Run all tests
npm test

# Run tests in watch mode (interactive)
npm test

# Run tests with coverage
npm test -- --coverage --watchAll=false
```

### Test Files

- `frontend/src/components/Quizmaster.test.js` - Quizmaster component tests
- `frontend/src/components/TeamLeader.test.js` - TeamLeader component tests

### Key Test Cases

1. **Answer Index Submission**: Critical test ensuring teams submit indices, not text (prevents "all answers wrong" bug)
2. **Component Rendering**: Validates UI elements render correctly
3. **Socket Integration**: Tests event listeners are properly registered
4. **Form Validation**: Ensures team join form works correctly with tokens

## Continuous Integration

Tests are designed to run in CI/CD pipelines. Add to your workflow:

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd backend && npm install && npm test

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm install && npm test -- --watchAll=false
```

## Test Coverage

Current coverage targets:
- Backend: 50% minimum (branches, functions, lines, statements)
- Frontend: React Testing Library standards

View coverage reports:
- Backend: `backend/coverage/lcov-report/index.html`
- Frontend: `frontend/coverage/lcov-report/index.html`

## Writing New Tests

### Backend Test Template

```javascript
describe('New Feature', () => {
  test('should do something', async () => {
    const response = await request(server).get('/api/endpoint');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
  });
});
```

### Frontend Test Template

```javascript
test('component renders correctly', () => {
  render(
    <MemoryRouter>
      <YourComponent />
    </MemoryRouter>
  );
  expect(screen.getByText(/Expected Text/i)).toBeInTheDocument();
});
```

## Common Issues

### Backend Tests

**Issue**: Tests fail with "port already in use"
**Fix**: Tests use port 3002-3003 to avoid conflicts with running server (port 3001)

**Issue**: Mock questions not loading
**Fix**: Ensure `jest.mock('./questions.json')` is at top of test file

### Frontend Tests

**Issue**: "Cannot find module 'socket.io-client'"
**Fix**: Run `npm install` in frontend directory

**Issue**: Router errors in tests
**Fix**: Wrap components in `<MemoryRouter>` for testing

## Best Practices

1. **Run tests before committing**: Catch bugs early
2. **Write tests for bug fixes**: Prevent regressions (e.g., answer index bug)
3. **Mock external dependencies**: Use jest.mock() for Socket.IO, fetch
4. **Test critical paths**: Focus on game logic, scoring, answer validation
5. **Keep tests fast**: Mock network calls, use test databases

## Quick Reference

```bash
# Run all tests (both backend and frontend)
npm test

# Backend only
cd backend && npm test

# Frontend only  
cd frontend && npm test

# Watch mode for development
npm run test:watch  # backend
npm test            # frontend (interactive by default)

# Coverage reports
npm test -- --coverage  # both
```

## Future Improvements

- [ ] Add E2E tests with Playwright/Cypress
- [ ] Test WebSocket reconnection scenarios
- [ ] Add load testing for concurrent users
- [ ] Test timer accuracy and synchronization
- [ ] Add visual regression tests for UI
