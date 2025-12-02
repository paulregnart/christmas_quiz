import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './Quizmaster.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://christmas-quiz.onrender.com';
console.log('BACKEND_URL:', BACKEND_URL);
const socket = io(BACKEND_URL);

function Quizmaster() {
  const [gameState, setGameState] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [teamUrls, setTeamUrls] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showUrlsModal, setShowUrlsModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(20);

  useEffect(() => {
    // Join as quizmaster
    socket.emit('join-quizmaster');

    // Fetch questions
    fetch(`${BACKEND_URL}/api/questions`)
      .then(res => res.json())
      .then(data => setQuestions(data));

    // Fetch team URLs
    fetch(`${BACKEND_URL}/api/team-urls`)
      .then(res => res.json())
      .then(data => setTeamUrls(data));

    // Listen for game state updates
    socket.on('game-state', (state) => {
      setGameState(state);
      if (state.timeRemaining !== undefined) {
        setTimeRemaining(state.timeRemaining);
      }
    });

    socket.on('team-urls', (urls) => {
      setTeamUrls(urls);
    });

    socket.on('timer-update', (data) => {
      setTimeRemaining(data.timeRemaining);
    });

    socket.on('time-up', () => {
      setTimeRemaining(0);
    });

    return () => {
      socket.off('game-state');
      socket.off('team-urls');
      socket.off('timer-update');
      socket.off('time-up');
    };
  }, []);

  const startQuestion = (index) => {
    socket.emit('start-question', index);
    setCurrentQuestionIndex(index);
  };

  const revealAnswers = () => {
    socket.emit('reveal-answers');
  };

  const resetGame = () => {
    if (window.confirm('Are you sure you want to reset the game? All scores will be lost.')) {
      socket.emit('reset-game');
      setCurrentQuestionIndex(0);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('URL copied to clipboard!');
  };

  if (!gameState || !questions.length) {
    return <div className="loading">Loading...</div>;
  }

  // Sort teams by score for leaderboard
  const sortedTeams = Object.entries(gameState.teams)
    .map(([id, team]) => ({ id, ...team }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="quizmaster">
      <div className="header">
        <h1>🎄 Christmas Quiz - Quizmaster Dashboard 🎅</h1>
        <button className="btn-urls" onClick={() => setShowUrlsModal(true)}>
          Show Team URLs
        </button>
      </div>

      {/* Team URLs Modal */}
      {showUrlsModal && teamUrls && (
        <div className="modal-overlay" onClick={() => setShowUrlsModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Team Leader URLs</h2>
            <div className="url-list">
              {Object.entries(teamUrls).map(([team, url]) => (
                <div key={team} className="url-item">
                  <label>{team.replace('team', 'Team ')}:</label>
                  <input type="text" value={url} readOnly />
                  <button onClick={() => copyToClipboard(url)}>Copy</button>
                </div>
              ))}
            </div>
            <button className="btn-close" onClick={() => setShowUrlsModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      <div className="main-content">
        {/* Leaderboard */}
        <div className="leaderboard">
          <h2>🏆 Leaderboard</h2>
          <div className="teams">
            {sortedTeams.map((team, index) => (
              <div key={team.id} className={`team-card rank-${index + 1}`}>
                <div className="team-rank">{index + 1}</div>
                <div className="team-info">
                  <div className="team-name">
                    {team.name || `Team ${team.id.replace('team', '')}`}
                    {!team.connected && <span className="disconnected"> (Not Connected)</span>}
                  </div>
                  <div className="team-score">{team.score} points</div>
                  {gameState.questionActive && team.answer && (
                    <div className="answered-indicator">✓ Answered</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Question Control */}
        <div className="question-control">
          <h2>Question Control</h2>
          
          {gameState.currentQuestion ? (
            <div className="current-question">
              <h3>Current Question #{gameState.questionIndex + 1}</h3>
              {gameState.questionActive && (
                <div className={`timer ${timeRemaining <= 5 ? 'timer-warning' : ''}`}>
                  ⏱️ Time: {timeRemaining}s
                </div>
              )}
              <p className="question-text">{gameState.currentQuestion.question}</p>
              <div className="options">
                {gameState.currentQuestion.options.map((option, idx) => (
                  <div 
                    key={idx} 
                    className={`option ${
                      gameState.answersRevealed && option === gameState.currentQuestion.correctAnswer 
                        ? 'correct' 
                        : ''
                    }`}
                  >
                    {option}
                  </div>
                ))}
              </div>
              
              {gameState.answersRevealed && gameState.currentQuestion.explanation && (
                <div className="explanation">
                  <strong>Explanation:</strong> {gameState.currentQuestion.explanation}
                </div>
              )}

              <div className="control-buttons">
                {!gameState.answersRevealed && (
                  <button className="btn-reveal" onClick={revealAnswers}>
                    Reveal Answers
                  </button>
                )}
                {gameState.answersRevealed && currentQuestionIndex < questions.length - 1 && (
                  <button className="btn-next" onClick={() => startQuestion(currentQuestionIndex + 1)}>
                    Next Question
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="start-game">
              <p>Ready to start the quiz?</p>
              <button className="btn-start" onClick={() => startQuestion(0)}>
                Start Question 1
              </button>
            </div>
          )}

          {/* Question List */}
          <div className="question-list">
            <h3>All Questions ({questions.length})</h3>
            <div className="questions">
              {questions.map((q, index) => (
                <button
                  key={q.id}
                  className={`question-btn ${currentQuestionIndex === index ? 'active' : ''}`}
                  onClick={() => startQuestion(index)}
                  disabled={gameState.questionActive && !gameState.answersRevealed}
                >
                  Q{index + 1}
                </button>
              ))}
            </div>
          </div>

          <button className="btn-reset" onClick={resetGame}>
            Reset Game
          </button>
        </div>
      </div>
    </div>
  );
}

export default Quizmaster;
