import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BrowseSkills from './pages/BrowseSkills';
import AddSkill from './pages/AddSkill';
import SkillDetail from './pages/SkillDetail';
import Stats from './pages/Stats';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<BrowseSkills />} />
            <Route path="/add-skill" element={<AddSkill />} />
            <Route path="/skill/:id" element={<SkillDetail />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="*" element={<div style={{ padding: '2rem', textAlign: 'center' }}><h1>404 - Page Not Found</h1></div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

