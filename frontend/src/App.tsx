import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { FeedPage } from './pages/FeedPage';
import { LoginPage } from './pages/LoginPage';
import { SavedGamesPage } from './pages/SavedGamesPage';
import { ReleasesPage } from './pages/ReleasesPage';
import { GameDetailPage } from './pages/GameDetailPage';
import { RankingPage } from './pages/RankingPage';
import { AdminUsersPage } from './pages/AdminUsersPage';

function AppContent() {
  return (
      <>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<FeedPage />} />
            <Route path="/games/:id" element={<GameDetailPage />} />
            <Route path="/releases" element={<ReleasesPage />} />
            <Route path="/ranking" element={<RankingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/saved" element={<SavedGamesPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Routes>
        </main>
      </>
  );
}

function App() {
  return (
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
  );
}

export default App;
