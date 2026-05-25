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
import { ProfilePage } from './pages/ProfilePage';
import { AdminGameRequestsPage } from './pages/AdminGameRequestsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ForbiddenPage } from './pages/ForbiddenPage';

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
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/saved" element={<SavedGamesPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/game-requests" element={<AdminGameRequestsPage />} />
            {/* Ruta comodín para páginas no encontradas */}
            <Route path="/403" element={<ForbiddenPage/>}></Route>
            <Route path="*" element={<NotFoundPage />} />
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
