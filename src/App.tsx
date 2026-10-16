import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './components/Login';
import Game from './components/Game';
import Leaderboard from './components/Leaderboard';
import Stats from './components/Stats';
import Navbar from './components/Navbar';

type Page = 'game' | 'leaderboard' | 'stats';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('game');
  const [gameKey, setGameKey] = useState(0);

  if (!isAuthenticated) {
    return <Login />;
  }

  const handleGameEnd = () => {
    // Force re-render to update stats
    setGameKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="pt-14">
        {currentPage === 'game' && <Game key={gameKey} onGameEnd={handleGameEnd} />}
        {currentPage === 'leaderboard' && <Leaderboard />}
        {currentPage === 'stats' && <Stats />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
