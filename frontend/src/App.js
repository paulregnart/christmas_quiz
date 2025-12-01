import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Quizmaster from './components/Quizmaster';
import TeamLeader from './components/TeamLeader';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Quizmaster />} />
          <Route path="/team/:token" element={<TeamLeader />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
