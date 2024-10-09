// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import Dashboard from './pages/Dashboard';
import StorySettings from './pages/StorySettings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/story-settings" element={<StorySettings />} />
      </Routes>
    </Router>
  );
}

export default App;
