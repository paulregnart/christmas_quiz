# Configuration Guide

## Customization Options

### Backend Configuration (backend/server.js)

#### Change Port
```javascript
const PORT = process.env.PORT || 3001; // Change 3001 to your preferred port
```

#### Change Number of Teams
Modify the `gameState.teams` object and `teamTokens`:

```javascript
// Add team4
let gameState = {
  teams: {
    team1: { name: '', score: 0, answer: null, connected: false },
    team2: { name: '', score: 0, answer: null, connected: false },
    team3: { name: '', score: 0, answer: null, connected: false },
    team4: { name: '', score: 0, answer: null, connected: false } // New team
  }
};

const teamTokens = {
  team1: uuidv4(),
  team2: uuidv4(),
  team3: uuidv4(),
  team4: uuidv4() // New team
};
```

#### Change Points per Correct Answer
Find this line:
```javascript
gameState.teams[teamId].score += 100; // Change 100 to your preferred points
```

### Frontend Configuration

#### Change Backend URL
Update Socket.IO connection in both components:

**frontend/src/components/Quizmaster.js:**
```javascript
const socket = io('http://localhost:3001'); // Change to your backend URL
```

**frontend/src/components/TeamLeader.js:**
```javascript
const socket = io('http://localhost:3001'); // Change to your backend URL
```

Also update fetch URLs:
```javascript
fetch('http://localhost:3001/api/questions') // Change URL
```

### Questions (backend/questions.json)

#### Add New Questions
```json
{
  "id": 21,
  "question": "What is your question?",
  "options": [
    "Option A",
    "Option B", 
    "Option C",
    "Option D"
  ],
  "correctAnswer": "Option A",
  "explanation": "Optional explanation here"
}
```

#### Question Format Rules
- `id`: Unique number
- `question`: The question text
- `options`: Array of 2-4 answer choices
- `correctAnswer`: Must exactly match one option
- `explanation`: Optional, shown after revealing answers

### Styling

#### Color Scheme (CSS files)
Main colors used:
- Christmas Green: `#165B33`
- Dark Green: `#0D3B20`
- Gold: `#FFD700`
- Red: `#C41E3A`

To change colors, search and replace in CSS files:
- `frontend/src/index.css`
- `frontend/src/components/Quizmaster.css`
- `frontend/src/components/TeamLeader.css`

#### Font Sizes
Search for `font-size` in CSS files to adjust text sizes.

### Production Deployment

#### Environment Variables
Create `.env` files:

**backend/.env:**
```
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com
```

**frontend/.env:**
```
REACT_APP_BACKEND_URL=https://your-backend-url.com
```

#### Update CORS Settings (backend/server.js)
```javascript
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000"
}));
```

#### Build Frontend for Production
```bash
cd frontend
npm run build
```

This creates an optimized build in `frontend/build/`

## Advanced Features

### Add Timer per Question
In `backend/server.js`, add timer logic:

```javascript
let questionTimer = null;

socket.on('start-question', (questionIndex) => {
  // ... existing code ...
  
  // Auto-reveal after 30 seconds
  questionTimer = setTimeout(() => {
    io.emit('time-up');
    // Auto reveal logic here
  }, 30000);
});

socket.on('reveal-answers', () => {
  clearTimeout(questionTimer);
  // ... existing code ...
});
```

### Add Sound Effects
1. Add sound files to `frontend/public/sounds/`
2. Play sounds in React components:

```javascript
const playSound = (soundFile) => {
  const audio = new Audio(`/sounds/${soundFile}`);
  audio.play();
};

// Use in component
playSound('correct.mp3'); // When answer is correct
playSound('wrong.mp3');   // When answer is wrong
```

### Persistent Storage
Replace in-memory storage with a database:

1. Install MongoDB or PostgreSQL
2. Create models for questions, teams, and game state
3. Replace `gameState` object with database queries

### Multiple Game Rooms
Add room functionality:
- Generate unique room codes
- Store multiple game states (one per room)
- Allow quizmaster to create/join rooms

## Performance Tips

- Limit Socket.IO message size
- Use Redis for session storage in production
- Enable gzip compression
- Cache static assets
- Use CDN for frontend in production

## Security Considerations

- Add authentication for quizmaster
- Validate team tokens on server
- Rate limit Socket.IO connections
- Sanitize user inputs (team names)
- Use HTTPS in production
- Set up proper CORS policies

---

Need help with specific customization? Check the main README.md or modify the code directly!
