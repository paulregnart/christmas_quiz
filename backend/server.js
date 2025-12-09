const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const questions = require('./questions.json');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "https://christmas-quiz-1.onrender.com",
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: process.env.FRONTEND_URL || "https://christmas-quiz-1.onrender.com"
}));
app.use(express.json());

// Game state
let gameState = {
  currentQuestion: null,
  questionIndex: -1,
  teams: {
    team1: { name: '', score: 0, answer: null, connected: false },
    team2: { name: '', score: 0, answer: null, connected: false },
    team3: { name: '', score: 0, answer: null, connected: false },
    team4: { name: '', score: 0, answer: null, connected: false },
    team5: { name: '', score: 0, answer: null, connected: false },
    team6: { name: '', score: 0, answer: null, connected: false },
    team7: { name: '', score: 0, answer: null, connected: false },
    team8: { name: '', score: 0, answer: null, connected: false },
    team9: { name: '', score: 0, answer: null, connected: false },
    team10: { name: '', score: 0, answer: null, connected: false }
  },
  questionActive: false,
  answersRevealed: false,
  timeRemaining: 20
};

// Timer for questions
let questionTimer = null;

// Generate unique URLs for team leaders
const teamTokens = {
  team1: uuidv4(),
  team2: uuidv4(),
  team3: uuidv4(),
  team4: uuidv4(),
  team5: uuidv4(),
  team6: uuidv4(),
  team7: uuidv4(),
  team8: uuidv4(),
  team9: uuidv4(),
  team10: uuidv4()
};

const frontendUrl = process.env.FRONTEND_URL || 'https://christmas-quiz-1.onrender.com';

console.log('\n=== TEAM LEADER URLS ===');
console.log(`Team 1:  ${frontendUrl}/team/${teamTokens.team1}`);
console.log(`Team 2:  ${frontendUrl}/team/${teamTokens.team2}`);
console.log(`Team 3:  ${frontendUrl}/team/${teamTokens.team3}`);
console.log(`Team 4:  ${frontendUrl}/team/${teamTokens.team4}`);
console.log(`Team 5:  ${frontendUrl}/team/${teamTokens.team5}`);
console.log(`Team 6:  ${frontendUrl}/team/${teamTokens.team6}`);
console.log(`Team 7:  ${frontendUrl}/team/${teamTokens.team7}`);
console.log(`Team 8:  ${frontendUrl}/team/${teamTokens.team8}`);
console.log(`Team 9:  ${frontendUrl}/team/${teamTokens.team9}`);
console.log(`Team 10: ${frontendUrl}/team/${teamTokens.team10}`);
console.log('========================\n');

// REST endpoints
app.get('/', (req, res) => {
  res.send(`
    <h1>Christmas Quiz Backend</h1>
    <p>Server is running! 🎄</p>
    <h2>Available Endpoints:</h2>
    <ul>
      <li><a href="/api/game-state">/api/game-state</a> - Current game state</li>
      <li><a href="/api/questions">/api/questions</a> - All quiz questions</li>
      <li><a href="/api/team-urls">/api/team-urls</a> - Team leader URLs</li>
      <li>POST /api/start-question - Start a question</li>
      <li>POST /api/reveal-answers - Reveal answers</li>
      <li>POST /api/reset-game - Reset game</li>
    </ul>
    <p>Frontend: <a href="${frontendUrl}">${frontendUrl}</a></p>
    <p>Quizmaster: <a href="${frontendUrl}/quizmaster">${frontendUrl}/quizmaster</a></p>
  `);
});

app.get('/api/team-urls', (req, res) => {
  res.json({
    team1: `${frontendUrl}/team/${teamTokens.team1}`,
    team2: `${frontendUrl}/team/${teamTokens.team2}`,
    team3: `${frontendUrl}/team/${teamTokens.team3}`,
    team4: `${frontendUrl}/team/${teamTokens.team4}`,
    team5: `${frontendUrl}/team/${teamTokens.team5}`,
    team6: `${frontendUrl}/team/${teamTokens.team6}`,
    team7: `${frontendUrl}/team/${teamTokens.team7}`,
    team8: `${frontendUrl}/team/${teamTokens.team8}`,
    team9: `${frontendUrl}/team/${teamTokens.team9}`,
    team10: `${frontendUrl}/team/${teamTokens.team10}`
  });
});

app.get('/api/questions', (req, res) => {
  res.json(questions);
});

app.get('/api/game-state', (req, res) => {
  res.json(gameState);
});

app.post('/api/start-question', (req, res) => {
  const { questionIndex } = req.body;
  
  if (questionIndex >= 0 && questionIndex < questions.length) {
    gameState.questionIndex = questionIndex;
    gameState.currentQuestion = questions[questionIndex];
    gameState.questionActive = true;
    gameState.answersRevealed = false;
    gameState.timeRemaining = 20;
    
    if (questionTimer) {
      clearInterval(questionTimer);
    }
    
    Object.keys(gameState.teams).forEach(teamId => {
      gameState.teams[teamId].answer = null;
    });
    
    io.emit('new-question', {
      question: gameState.currentQuestion.question,
      options: gameState.currentQuestion.options,
      questionNumber: questionIndex + 1,
      totalQuestions: questions.length,
      timeLimit: 20
    });
    
    questionTimer = setInterval(() => {
      gameState.timeRemaining--;
      io.emit('timer-update', { timeRemaining: gameState.timeRemaining });
      
      if (gameState.timeRemaining <= 0) {
        clearInterval(questionTimer);
        gameState.questionActive = false;
        io.emit('time-up');
      }
    }, 1000);
    
    res.json({ success: true, message: `Question ${questionIndex + 1} started` });
  } else {
    res.status(400).json({ success: false, message: 'Invalid question index' });
  }
});

app.post('/api/reveal-answers', (req, res) => {
  if (gameState.currentQuestion) {
    if (questionTimer) {
      clearInterval(questionTimer);
    }
    
    gameState.answersRevealed = true;
    gameState.questionActive = false;
    
    const correctAnswer = gameState.currentQuestion.correctAnswer;
    
    Object.keys(gameState.teams).forEach(teamId => {
      if (gameState.teams[teamId].answer === correctAnswer) {
        gameState.teams[teamId].score += 100;
      }
    });
    
    io.emit('answers-revealed', {
      correctAnswer,
      teams: gameState.teams,
      explanation: gameState.currentQuestion.explanation || ''
    });
    
    io.to('quizmaster').emit('game-state', gameState);
    
    res.json({ success: true, correctAnswer, teams: gameState.teams });
  } else {
    res.status(400).json({ success: false, message: 'No active question' });
  }
});

app.post('/api/reset-game', (req, res) => {
  if (questionTimer) {
    clearInterval(questionTimer);
  }
  
  gameState.currentQuestion = null;
  gameState.questionIndex = -1;
  gameState.questionActive = false;
  gameState.answersRevealed = false;
  gameState.timeRemaining = 20;
  
  Object.keys(gameState.teams).forEach(teamId => {
    gameState.teams[teamId].name = '';
    gameState.teams[teamId].score = 0;
    gameState.teams[teamId].answer = null;
    gameState.teams[teamId].connected = false;
  });
  
  io.emit('game-reset');
  io.to('quizmaster').emit('game-state', gameState);
  
  res.json({ success: true, message: 'Game reset successfully' });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join as quizmaster
  socket.on('join-quizmaster', () => {
    socket.join('quizmaster');
    socket.emit('game-state', gameState);
    socket.emit('team-urls', teamTokens);
    console.log('Quizmaster joined');
  });

  // Join as team leader
  socket.on('join-team', ({ token, teamName }) => {
    const teamId = Object.keys(teamTokens).find(key => teamTokens[key] === token);
    
    if (teamId && gameState.teams[teamId]) {
      socket.join(teamId);
      socket.teamId = teamId; // Store teamId with socket
      gameState.teams[teamId].name = teamName;
      gameState.teams[teamId].connected = true;
      
      socket.emit('team-joined', { teamId, teamName });
      socket.emit('game-state', gameState);
      
      // Notify quizmaster
      io.to('quizmaster').emit('game-state', gameState);
      
      console.log(`${teamName} joined as ${teamId}`);
    } else {
      socket.emit('error', 'Invalid team token');
    }
  });

  // Quizmaster starts a question
  socket.on('start-question', (questionIndex) => {
    if (questionIndex >= 0 && questionIndex < questions.length) {
      gameState.questionIndex = questionIndex;
      gameState.currentQuestion = questions[questionIndex];
      gameState.questionActive = true;
      gameState.answersRevealed = false;
      gameState.timeRemaining = 20;
      
      // Clear any existing timer
      if (questionTimer) {
        clearInterval(questionTimer);
      }
      
      // Reset team answers
      Object.keys(gameState.teams).forEach(teamId => {
        gameState.teams[teamId].answer = null;
      });
      
      // Send question to everyone
      io.emit('new-question', {
        question: gameState.currentQuestion.question,
        options: gameState.currentQuestion.options,
        questionNumber: questionIndex + 1,
        totalQuestions: questions.length,
        timeLimit: 20
      });
      
      // Start countdown timer
      questionTimer = setInterval(() => {
        gameState.timeRemaining--;
        io.emit('timer-update', { timeRemaining: gameState.timeRemaining });
        
        if (gameState.timeRemaining <= 0) {
          clearInterval(questionTimer);
          gameState.questionActive = false;
          io.emit('time-up');
          console.log('Time is up!');
        }
      }, 1000);
      
      console.log(`Question ${questionIndex + 1} started with 20 second timer`);
    }
  });

  // Team submits answer
  socket.on('submit-answer', ({ teamId, answer }) => {
    if (gameState.questionActive && gameState.teams[teamId]) {
      gameState.teams[teamId].answer = answer;
      
      // Notify quizmaster of answer submission
      io.to('quizmaster').emit('game-state', gameState);
      
      // Confirm to team
      socket.emit('answer-submitted');
      
      console.log(`${gameState.teams[teamId].name} answered: ${answer}`);
    }
  });

  // Quizmaster reveals answers and updates scores
  socket.on('reveal-answers', () => {
    if (gameState.currentQuestion) {
      // Clear timer
      if (questionTimer) {
        clearInterval(questionTimer);
      }
      
      gameState.answersRevealed = true;
      gameState.questionActive = false;
      
      const correctAnswer = gameState.currentQuestion.correctAnswer;
      
      // Update scores
      Object.keys(gameState.teams).forEach(teamId => {
        if (gameState.teams[teamId].answer === correctAnswer) {
          gameState.teams[teamId].score += 100;
        }
      });
      
      // Send results to everyone
      io.emit('answers-revealed', {
        correctAnswer,
        teams: gameState.teams,
        explanation: gameState.currentQuestion.explanation || ''
      });
      
      io.to('quizmaster').emit('game-state', gameState);
      
      console.log(`Answers revealed. Correct answer: ${correctAnswer}`);
    }
  });

  // Reset game
  socket.on('reset-game', () => {
    // Clear timer
    if (questionTimer) {
      clearInterval(questionTimer);
    }
    
    gameState.currentQuestion = null;
    gameState.questionIndex = -1;
    gameState.questionActive = false;
    gameState.answersRevealed = false;
    gameState.timeRemaining = 20;
    
    Object.keys(gameState.teams).forEach(teamId => {
      gameState.teams[teamId].name = '';
      gameState.teams[teamId].score = 0;
      gameState.teams[teamId].answer = null;
      gameState.teams[teamId].connected = false;
    });
    
    io.emit('game-reset');
    io.to('quizmaster').emit('game-state', gameState);
    
    console.log('Game reset');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
