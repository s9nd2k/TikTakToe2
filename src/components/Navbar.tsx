import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { audioService } from '../utils/audio';

type Page = 'game' | 'leaderboard' | 'stats';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleNavigate = (page: Page) => {
    audioService.playClick();
    onNavigate(page);
  };

  const handleLogout = () => {
    audioService.playClick();
    logout();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-xl">🎮</span>
            <span className="font-bold text-gray-900 dark:text-white hidden sm:block">
              Tic-Tac-Toe
            </span>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleNavigate('game')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentPage === 'game'
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              🎯 Игра
            </button>
            <button
              onClick={() => handleNavigate('leaderboard')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentPage === 'leaderboard'
                  ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              🏆 Рекорды
            </button>
            <button
              onClick={() => handleNavigate('stats')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentPage === 'stats'
                  ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              📊 Статистика
            </button>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            {/* User info */}
            {user && (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.username}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all"
                  title="Выйти"
                >
                  🚪
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
