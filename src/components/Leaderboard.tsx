import React, { useState, useEffect } from 'react';
import { getLeaderboard, LeaderboardEntry } from '../utils/storage';
import { audioService } from '../utils/audio';

export default function Leaderboard() {
  const [boardSize, setBoardSize] = useState(3);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setEntries(getLeaderboard(boardSize, 10));
  }, [boardSize]);

  const handleSizeChange = (size: number) => {
    setBoardSize(size);
    audioService.playClick();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getMedal = (index: number): string => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
            🏆 Таблица рекордов
          </h2>

          {/* Size filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
              Размер поля
            </label>
            <div className="flex gap-2 justify-center flex-wrap">
              {[3, 4, 5, 6, 7].map(size => (
                <button
                  key={size}
                  onClick={() => handleSizeChange(size)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    boardSize === size
                      ? 'bg-yellow-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {size}×{size}
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard table */}
          {entries.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-500 dark:text-gray-400">
                Пока нет рекордов для поля {boardSize}×{boardSize}
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                Сыграйте и победите, чтобы попасть в таблицу!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    index === 0
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                      : index === 1
                      ? 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600'
                      : index === 2
                      ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                      : 'bg-gray-50 dark:bg-gray-700/30 border border-transparent'
                  }`}
                >
                  <div className="w-8 text-center text-lg font-bold">
                    {getMedal(index)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {entry.username}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(entry.timestamp).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-lg text-gray-900 dark:text-white">
                      {formatTime(entry.durationSeconds)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
