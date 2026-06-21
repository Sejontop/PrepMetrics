import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import AppLayout from './components/layout/AppLayout';
import AdminLayout from './components/layout/AdminLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// User pages
import DashboardPage from './pages/user/DashboardPage';
import SubjectsPage from './pages/user/SubjectsPage';
import QuizPage from './pages/user/QuizPage';
import AttemptResultPage from './pages/user/AttemptResultPage';
import AnalyticsPage from './pages/user/AnalyticsPage';
import LeaderboardPage from './pages/user/LeaderboardPage';
import CertificatesPage from './pages/user/CertificatesPage';
import ProfilePage from './pages/user/ProfilePage';
import HistoryPage from './pages/user/HistoryPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSubjects from './pages/admin/AdminSubjects';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login"    element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
      <Route index element={<Navigate to="/dashboard" />} />
      <Route path="dashboard"    element={<DashboardPage />} />
      <Route path="subjects"     element={<SubjectsPage />} />
      <Route path="quiz/:quizId" element={<QuizPage />} />
      <Route path="attempts/:id" element={<AttemptResultPage />} />
      <Route path="analytics"    element={<AnalyticsPage />} />
      <Route path="leaderboard"  element={<LeaderboardPage />} />
      <Route path="certificates" element={<CertificatesPage />} />
      <Route path="history"      element={<HistoryPage />} />
      <Route path="profile"      element={<ProfilePage />} />
    </Route>

    <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
      <Route index element={<AdminDashboard />} />
      <Route path="questions" element={<AdminQuestions />} />
      <Route path="users"     element={<AdminUsers />} />
      <Route path="subjects"  element={<AdminSubjects />} />
    </Route>

    <Route path="*" element={<Navigate to="/dashboard" />} />
  </Routes>
);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ style: { borderRadius: 8, fontSize: 14 } }} />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
