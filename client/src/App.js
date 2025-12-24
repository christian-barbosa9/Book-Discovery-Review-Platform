import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import BrowseSkills from './pages/BrowseSkills';
import AddSkill from './pages/AddSkill';
import SkillDetail from './pages/SkillDetail';
import Stats from './pages/Stats';
import './App.css';
import './pages/NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <Link to="/" className="home-link">Go Back Home</Link>
      </div>
    </div>
  );
};

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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

