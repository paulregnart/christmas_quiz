import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import './TeamLeader.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
const socket = io(BACKEND_URL);

function TeamLeader() {
  const { token } = useParams();
  const [teamName, setTeamName] = useState('');
  const [joined, setJoined] = useState(false);
  const [teamId, setTeamId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [revealedAnswer, setRevealedAnswer] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(20);

  useEffect(() => {
    // Listen for game state updates
    socket.on('game-state', (state) => {
      setGameState(state);
    });

    // Listen for team joined confirmation
    socket.on('team-joined', ({ teamId: id, teamName: name }) => {
      setTeamId(id);
      setJoined(true);
    });

    // Listen for new questions
    socket.on('new-question', (question) => {
      setCurrentQuestion(question);
      setSelectedAnswer(null);
      setAnswerSubmitted(false);
      setRevealedAnswer(null);
      setTimeRemaining(question.timeLimit || 20);
    });

    // Listen for timer updates
    socket.on('timer-update', (data) => {
      setTimeRemaining(data.timeRemaining);
    });

    // Listen for time up
    socket.on('time-up', () => {
      setTimeRemaining(0);
      setAnswerSubmitted(true);
    });

    // Listen for answer submission confirmation
    socket.on('answer-submitted', () => {
      setAnswerSubmitted(true);
    });

    // Listen for revealed answers
    socket.on('answers-revealed', (data) => {
      setRevealedAnswer(data);
    });

    // Listen for game reset
    socket.on('game-reset', () => {
      setCurrentQuestion(null);
      setSelectedAnswer(null);
      setAnswerSubmitted(false);
      setRevealedAnswer(null);
      setTimeRemaining(20);
    });

    socket.on('error', (message) => {
      alert(message);
    });

    return () => {
      socket.off('game-state');
      socket.off('team-joined');
      socket.off('new-question');
      socket.off('timer-update');
      socket.off('time-up');
      socket.off('answer-submitted');
      socket.off('answers-revealed');
      socket.off('game-reset');
      socket.off('error');
    };
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (teamName.trim()) {
      socket.emit('join-team', { token, teamName: teamName.trim() });
    }
  };

  const handleAnswerSelect = (answer) => {
    if (!answerSubmitted) {
      setSelectedAnswer(answer);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer && teamId) {
      socket.emit('submit-answer', { teamId, answer: selectedAnswer });
    }
  };

  if (!joined) {
    return (
      <div className="team-leader join-screen">
        <div className="join-container">
          <h1>🎄 Christmas Quiz 🎅</h1>
          <h2>Team Leader Login</h2>
          <form onSubmit={handleJoin}>
            <input
              type="text"
              placeholder="Enter your team name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              maxLength={30}
              required
            />
            <button type="submit" className="btn-join">
              Join Quiz
            </button>
          </form>
        </div>
      </div>
    );
  }

  const myTeam = gameState?.teams?.[teamId];
  const myScore = myTeam?.score || 0;

  return (
    <div className="team-leader game-screen">
      <div className="header">
        <h1>🎄 {teamName} 🎄</h1>
        <div className="score">Score: {myScore}</div>
      </div>

      <div className="content">
        {!currentQuestion && !revealedAnswer && (
          <div className="waiting">
            <div className="snowflake">❄️</div>
            <h2>Waiting for the quiz to start...</h2>
            <p>The quizmaster will start the questions soon!</p>
          </div>
        )}

        {currentQuestion && !revealedAnswer && (
          <div className="question-container">
            <div className="question-header">
              <span className="question-number">
                Question {currentQuestion.questionNumber} of {currentQuestion.totalQuestions}
              </span>
              <div className={`timer ${timeRemaining <= 5 ? 'timer-warning' : ''}`}>
                ⏱️ {timeRemaining}s
              </div>
            </div>
            
            <h2 className="question-text">{currentQuestion.question}</h2>
            
            <div className="options">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className={`option-btn ${selectedAnswer === option ? 'selected' : ''} ${
                    answerSubmitted ? 'disabled' : ''
                  }`}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={answerSubmitted}
                >
                  {option}
                </button>
              ))}
            </div>

            {!answerSubmitted && selectedAnswer && (
              <button className="btn-submit" onClick={handleSubmitAnswer}>
                Submit Answer
              </button>
            )}

            {answerSubmitted && (
              <div className="submitted-message">
                ✓ Answer submitted! Waiting for results...
              </div>
            )}
          </div>
        )}

        {revealedAnswer && (
          <div className="results-container">
            <h2>Results</h2>
            
            <div className={`result-card ${
              revealedAnswer.teams[teamId]?.answer === revealedAnswer.correctAnswer ? 'correct' : 'incorrect'
            }`}>
              {revealedAnswer.teams[teamId]?.answer === revealedAnswer.correctAnswer ? (
                <div className="result-icon">🎉</div>
              ) : (
                <div className="result-icon">😔</div>
              )}
              
              <h3>
                {revealedAnswer.teams[teamId]?.answer === revealedAnswer.correctAnswer 
                  ? 'Correct! +100 points' 
                  : 'Incorrect'}
              </h3>
              
              <p>Your answer: <strong>{revealedAnswer.teams[teamId]?.answer || 'No answer'}</strong></p>
              <p>Correct answer: <strong>{revealedAnswer.correctAnswer}</strong></p>
            </div>

            {revealedAnswer.explanation && (
              <div className="explanation">
                <strong>Did you know?</strong> {revealedAnswer.explanation}
              </div>
            )}

            <div className="leaderboard-mini">
              <h3>Current Standings</h3>
              {Object.entries(revealedAnswer.teams)
                .map(([id, team]) => ({ id, ...team }))
                .sort((a, b) => b.score - a.score)
                .map((team, index) => (
                  <div 
                    key={team.id} 
                    className={`team-row ${team.id === teamId ? 'highlight' : ''}`}
                  >
                    <span className="rank">{index + 1}.</span>
                    <span className="name">{team.name}</span>
                    <span className="score">{team.score}</span>
                  </div>
                ))}
            </div>

            <div className="waiting">
              <p>Waiting for next question...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamLeader;
