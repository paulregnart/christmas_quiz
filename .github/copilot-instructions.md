# Christmas Quiz - AI Agent Instructions

## Architecture Overview

This is a **real-time Kahoot-style quiz game** with three services:
1. **Backend** (`backend/`): Node.js + Express + Socket.IO server managing game state
2. **Frontend** (`frontend/`): React SPA with two views (Quizmaster & Team Leaders)
3. **MCP Server** (`mcp-server/`): Model Context Protocol server for AI control via Claude Desktop

**Critical pattern**: Backend is **dual-mode** - Socket.IO for real-time UI, REST API for MCP integration.

## Data Flow & State Management

- **Game state lives in backend memory** (`gameState` object in `server.js`)
- Teams join via **unique UUID tokens** generated at server startup
- Frontend routes: `/` = Quizmaster, `/team/:token` = Team Leader interface
- Questions stored in `backend/questions.json` with structure:
  ```json
  {
    "id": 1,
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0  // INDEX (0-3), not text!
  }
  ```

**Critical bug fixed**: `correctAnswer` must be an **index** (0-3), not text. Teams submit indices.

## Deployment Architecture (Render)

Two separate services defined in `render.yaml`:
- **Backend**: `christmas-quiz-backend` → `https://christmas-quiz.onrender.com`
- **Frontend**: `christmas-quiz-frontend` → `https://christmas-quiz-1.onrender.com`

**Environment variables**:
- Backend needs: `FRONTEND_URL` (for CORS & team URLs)
- Frontend needs: `REACT_APP_BACKEND_URL` (for Socket.IO connection)
- MCP needs: `QUIZ_BACKEND_URL` (points to backend REST API)

## Development Workflow

**Local testing**:
```bash
# Terminal 1 - Backend
cd backend && npm start  # Runs on :3001

# Terminal 2 - Frontend  
cd frontend && npm start  # Runs on :3000

# Terminal 3 - MCP (optional)
cd mcp-server && npm install
```

**Deployment**: Push to `main` branch triggers auto-deploy on Render (2-3 min). Backend restart **clears game state** (teams must reconnect).

## MCP Server Integration

MCP allows **Claude Desktop to control the quiz** via natural language:
- Config location: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
- Set `QUIZ_BACKEND_URL` to backend (local: `http://localhost:3001`, prod: `https://christmas-quiz.onrender.com`)
- **Must restart Claude Desktop** after config changes
- Tools: `get_game_state`, `start_question`, `reveal_answers`, `get_team_urls`, etc.

## Key Patterns & Conventions

1. **Answer validation**: Backend compares `team.answer` (index) === `correctAnswer` (index)
2. **Socket.IO events**: `join-quizmaster`, `join-team`, `start-question`, `submit-answer`, `reveal-answers`, `reset-game`
3. **Timer management**: 20-second countdown via `setInterval`, cleared on reveal/timeout
4. **Team URLs**: Generated once at startup, persist until backend restart
5. **CORS**: Backend explicitly allows frontend URL, fails silently if misconfigured

## Common Tasks

**Add/modify questions**: Edit `backend/questions.json`, ensure `correctAnswer` is index, not text.

**Change team count**: Update `gameState.teams` object in `server.js` (currently 10 teams).

**Debug Socket.IO**: Check browser console for connection logs. Backend logs show all socket events.

**Fix "first answer always correct" bug**: Shuffle `options` array and update `correctAnswer` index accordingly.

## Critical Files

- `backend/server.js` - Dual Socket.IO/REST server, game state, timer logic
- `backend/questions.json` - Quiz data (correctAnswer MUST be index)
- `frontend/src/components/Quizmaster.js` - Question control, score display
- `frontend/src/components/TeamLeader.js` - Answer submission interface
- `mcp-server/index.js` - AI control layer, REST client
- `render.yaml` - Deployment config for both services
