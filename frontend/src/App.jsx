// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';

// Components
import Navbar from './components/layout/Navbar';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/user/Dashboard';
import SubjectList from './pages/subjects/SubjectList';
import QuizSetup from './pages/quiz/QuizSetup';
import QuizInterface from './pages/quiz/QuizInterface';
import QuizResults from './pages/quiz/QuizResults';
import Analytics from './pages/analytics/Analytics';
import SubjectAnalytics from './pages/analytics/SubjectAnalytics';
import Leaderboard from './pages/leaderboard/leaderboard';
import Profile from './pages/user/Profile';
import Certificates from './pages/certificates/Certificates';
import AdminDashboard from './pages/admin/AdminDashboard';
import QuestionManagement from './pages/admin/QuestionManagement';

import './App.css';

function App() {
  const { theme } = useTheme();

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <Router>
      <div className={`app ${theme}`}>
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            
            {/* Protected User Routes */}
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/subjects" element={<PrivateRoute><SubjectList /></PrivateRoute>} />
            <Route path="/quiz/setup/:subjectId" element={<PrivateRoute><QuizSetup /></PrivateRoute>} />
            <Route path="/quiz/:quizId" element={<PrivateRoute><QuizInterface /></PrivateRoute>} />
            <Route path="/quiz/:quizId/results" element={<PrivateRoute><QuizResults /></PrivateRoute>} />
            <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
            <Route path="/analytics/:subjectId" element={<PrivateRoute><SubjectAnalytics /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/certificates" element={<PrivateRoute><Certificates /></PrivateRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/questions" element={<AdminRoute><QuestionManagement /></AdminRoute>} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
