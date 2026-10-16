import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getPlayerStats, getUserResults } from '../utils/storage';

export default function Stats() {
  const { user } = useAuth();
  if (!user) return null;

  const stats = getPlayerStats(user.id);
  const results = getUserResults(user.id);
  const recentGames = results.slice(-10).reverse();

  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const winRate = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl text-white font-bold">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user.username}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Участник с {new Date(user.createdAt).toLocaleDateString('ru-RU')}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center border border-blue-100 dark:border-blue-800">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalGames}</div>
              <div className="text-sm text-blue-500 dark:text-blue-300">Игр сыграно</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center border border-green-100 dark:border-green-800">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{winRate}%</div>
              <div className="text-sm text-green-500 dark:text-green-300">Процент побед</div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-center border border-emerald-100 dark:border-emerald-800">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.wins}</div>
              <div className="text-sm text-emerald-500 dark:text-emerald-300">Побед</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center border border-red-100 dark:border-red-800">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.losses}</div>
              <div className="text-sm text-red-500 dark:text-red-300">Поражений</div>
            </div>
          </div>

          {/* Draws */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 text-center border border-yellow-100 dark:border-yellow-800 mb-6">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.draws}</div>
            <div className="text-sm text-yellow-500 dark:text-yellow-300">Ничьих</div>
          </div>

          {/* Best Times */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              ⚡ Лучшее время (победы)
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">3×3</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">
                  {formatTime(stats.bestTime3x3)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">5×5</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">
                  {formatTime(stats.bestTime5x5)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">7×7</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">
                  {formatTime(stats.bestTime7x7)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Games */}
        {recentGames.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📋 Последние игры
            </h3>
            <div className="space-y-2">
              {recentGames.map((game, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    game.winner === game.playerSymbol
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800'
                      : game.winner === 'draw'
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800'
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {game.winner === game.playerSymbol ? '✅' : game.winner === 'draw' ? '🤝' : '❌'}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {game.boardSize}×{game.boardSize}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(game.timestamp).toLocaleDateString('ru-RU')}
                  </div>
                  <div className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                    {formatTime(game.durationSeconds)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
