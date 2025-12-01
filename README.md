# 🎄 Christmas Quiz Game 🎅

A real-time, Kahoot-style quiz game for Christmas events with WebSocket support for live interactions between quizmaster and team leaders.

## Features

- **Ten Team Slots**: Unique URLs for each of the 10 teams to join
- **Quizmaster Dashboard**: Control questions, reveal answers, and track scores
- **Real-time Updates**: Socket.IO powers instant communication
- **15 Christmas Questions**: Medium-difficulty trivia about Christmas
- **20-Second Timer**: Countdown timer for each question with visual warnings
- **Live Leaderboard**: Track team scores in real-time
- **Festive Design**: Christmas-themed UI with green, red, and gold colors

## Tech Stack

- **Backend**: Node.js + Express + Socket.IO
- **Frontend**: React + Socket.IO Client
- **Styling**: CSS with festive Christmas theme

## Project Structure

```
Christmas Quiz/
├── backend/
│   ├── server.js           # Express server with Socket.IO
│   ├── questions.json      # 20 Christmas trivia questions
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Quizmaster.js      # Quizmaster dashboard
│   │   │   ├── Quizmaster.css
│   │   │   ├── TeamLeader.js      # Team leader interface
│   │   │   └── TeamLeader.css
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3001` and display the three team URLs in the console.

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React app:
```bash
npm start
```

The app will open at `http://localhost:3000`

## How to Use

### For the Quizmaster

1. Open `http://localhost:3000` in your browser
2. Click "Show Team URLs" to get the unique URLs for each team
3. Share these URLs with your three team leaders
4. Click "Start Question 1" to begin the quiz
5. Wait for teams to submit answers
6. Click "Reveal Answers" to show the correct answer and update scores
7. Click "Next Question" to continue

### For Team Leaders

1. Receive your unique URL from the quizmaster (e.g., `http://localhost:3000/team/abc-123-xyz`)
2. Enter your team name and join
3. Wait for questions to appear
4. Select your answer and click "Submit Answer"
5. View results and your current standing after each question

## Game Flow

1. **Setup**: Quizmaster shares team URLs with team leaders
2. **Team Join**: Each team leader enters their name and joins via their unique URL
3. **Question Start**: Quizmaster starts a question
4. **Answer Submission**: Teams select and submit their answers
5. **Reveal**: Quizmaster reveals the correct answer
6. **Scoring**: Correct answers earn 100 points
7. **Repeat**: Continue through all 20 questions
8. **Winner**: Team with the highest score wins!

## Features Explained

### Real-time Communication
- Socket.IO enables instant updates between quizmaster and teams
- Teams see questions immediately when started
- Quizmaster sees when teams submit answers
- Everyone sees results simultaneously

### Scoring System
- Each correct answer: **+100 points**
- Incorrect answers: **0 points**
- Live leaderboard updates after each question

### Question Management
- 20 pre-loaded Christmas trivia questions
- Quizmaster can jump to any question
- Questions can be started in any order
- Some questions include explanations

### Unique Team URLs
- Three unique tokens generated on server start
- Prevents unauthorized access
- Each team can only join with their specific URL

## Customization

### Adding More Questions

Edit `backend/questions.json`:

```json
{
  "id": 21,
  "question": "Your question here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "Option A",
  "explanation": "Optional explanation"
}
```

### Changing Number of Teams

Edit `backend/server.js` and modify the `gameState.teams` object and `teamTokens` to add or remove teams.

### Styling

Modify the CSS files in `frontend/src/components/` to customize colors and appearance.

## Development

### Backend (with auto-reload)
```bash
cd backend
npm install -g nodemon  # If not already installed
npm run dev
```

### Frontend (already includes hot reload)
```bash
cd frontend
npm start
```

## Troubleshooting

**Teams can't connect:**
- Ensure backend server is running on port 3001
- Check that team URLs are copied correctly
- Verify no firewall blocking WebSocket connections

**Frontend won't start:**
- Make sure you're using Node.js v14 or higher
- Try deleting `node_modules` and running `npm install` again

**Questions not loading:**
- Ensure `questions.json` is in the backend directory
- Check backend console for any errors

## Future Enhancements

- Add sound effects
- Timer for each question
- More question categories
- Persistent storage (database)
- Admin panel to create/edit questions
- Mobile-responsive improvements
- Multiple game rooms

## License

MIT License - feel free to use for your Christmas events!

---

**Merry Christmas and Happy Quizzing! 🎄🎅⛄**
