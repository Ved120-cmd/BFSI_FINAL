import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import Predictions from './Predictions';
import Profile from './Profile';
import Layout from './Layout';
import Reports from './Reports';   // ← correct name + path

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Pages wrapped in Layout */}
        <Route path="/dashboard"   element={<Layout><Dashboard /></Layout>} />
        <Route path="/predictions" element={<Layout><Predictions /></Layout>} />
        <Route path="/profile"     element={<Layout><Profile /></Layout>} />
        <Route path="/reports"     element={<Layout><Reports /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;