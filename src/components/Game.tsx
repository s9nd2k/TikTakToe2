import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../hooks/useGame';
import { saveGameResult } from '../utils/storage';
import { audioService } from '../utils/audio';

interface GameProps {
  onGameEnd: () => void;
}

export default function Game({ onGameEnd }: GameProps) {
  const { user } = useAuth();
  const [boardSize, setBoardSize] = useState(3);
  const [playerSymbol, setPlayerSymbol] = useState<'X' | 'O'>('X');
  const [vsComputer, setVsComputer] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(audioService.isEnabled());
  const resultSavedRef = React.useRef(false);

  const game = useGame(boardSize, playerSymbol, vsComputer);

  const handleStartGame = () => {
    audioService.playClick();
    setGameStarted(true);
  };

  const handleNewGame = () => {
    audioService.playClick();
    resultSavedRef.current = false;
    game.resetGame();
  };

  const handleBackToMenu = () => {
    audioService.playClick();
    resultSavedRef.current = false;
    setGameStarted(false);
    game.resetGame();
  };

  // Auto-save when game ends
  React.useEffect(() => {
    if (game.status !== 'playing' && game.moveCount > 0 && user && !resultSavedRef.current) {
      resultSavedRef.current = true;
      saveGameResult({
        id: crypto.randomUUID(),
        userId: user.id,
        username: user.username,
        boardSize,
        durationSeconds: game.timer,
        winner: game.status === 'won' ? playerSymbol : game.status === 'lost' ? (playerSymbol === 'X' ? 'O' : 'X') : 'draw',
        playerSymbol,
        timestamp: new Date().toISOString(),
      });
      onGameEnd();
    }
  }, [game.status, game.moveCount, user, boardSize, game.timer, playerSymbol, onGameEnd]);

  const handleBack = () => {
    handleBackToMenu();
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    audioService.setEnabled(newState);
    localStorage.setItem('ttt_sound', newState.toString());
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
              🎯 Настройки игры
            </h2>

            {/* Board Size */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Размер поля
              </label>
              <div className="flex gap-2 flex-wrap">
                {[3, 4, 5, 6, 7].map(size => (
                  <button
                    key={size}
                    onClick={() => { setBoardSize(size); audioService.playClick(); }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      boardSize === size
                        ? 'bg-blue-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {size}×{size}
                  </button>
                ))}
              </div>
            </div>

            {/* Player Symbol */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Ваш символ
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => { setPlayerSymbol('X'); audioService.playClick(); }}
                  className={`flex-1 py-3 rounded-lg font-bold text-xl transition-all ${
                    playerSymbol === 'X'
                      ? 'bg-blue-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  ✕
                </button>
                <button
                  onClick={() => { setPlayerSymbol('O'); audioService.playClick(); }}
                  className={`flex-1 py-3 rounded-lg font-bold text-xl transition-all ${
                    playerSymbol === 'O'
                      ? 'bg-purple-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  ○
                </button>
              </div>
            </div>

            {/* Game Mode */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Режим игры
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => { setVsComputer(true); audioService.playClick(); }}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                    vsComputer
                      ? 'bg-green-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  🤖 vs Компьютер
                </button>
                <button
                  onClick={() => { setVsComputer(false); audioService.playClick(); }}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                    !vsComputer
                      ? 'bg-orange-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  👥 2 Игрока
                </button>
              </div>
            </div>

            <button
              onClick={handleStartGame}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              🚀 Начать игру
            </button>
          </div>
        </div>
      </div>
    );
  }

  const cellSize = boardSize <= 4 ? 'w-16 h-16 text-3xl' : boardSize <= 5 ? 'w-14 h-14 text-2xl' : 'w-11 h-11 text-xl';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-lg mb-4">
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
          <button
            onClick={handleBack}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            ← Назад
          </button>
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
              ⏱ {formatTime(game.timer)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {boardSize}×{boardSize} | {vsComputer ? '🤖' : '👥'}
            </div>
          </div>
          <button
            onClick={toggleSound}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors text-xl"
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="mb-4">
        {game.status === 'playing' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl px-6 py-3 shadow-lg border border-gray-200 dark:border-gray-700">
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Ход: <span className="text-2xl">{game.currentPlayer === 'X' ? '✕' : '○'}</span>
            </span>
          </div>
        )}
        {game.status === 'won' && (
          <div className="bg-green-100 dark:bg-green-900/50 rounded-xl px-6 py-3 shadow-lg border border-green-300 dark:border-green-700 animate-pulse">
            <span className="text-green-700 dark:text-green-300 font-bold text-lg">
              🎉 Победа! Поздравляем!
            </span>
          </div>
        )}
        {game.status === 'lost' && (
          <div className="bg-red-100 dark:bg-red-900/50 rounded-xl px-6 py-3 shadow-lg border border-red-300 dark:border-red-700">
            <span className="text-red-700 dark:text-red-300 font-bold text-lg">
              😔 Поражение! Попробуйте ещё раз
            </span>
          </div>
        )}
        {game.status === 'draw' && (
          <div className="bg-yellow-100 dark:bg-yellow-900/50 rounded-xl px-6 py-3 shadow-lg border border-yellow-300 dark:border-yellow-700">
            <span className="text-yellow-700 dark:text-yellow-300 font-bold text-lg">
              🤝 Ничья!
            </span>
          </div>
        )}
      </div>

      {/* Game Board */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl border border-gray-200 dark:border-gray-700">
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${boardSize}, 1fr)` }}
        >
          {game.board.map((cell, index) => {
            const isWinCell = game.winLine?.includes(index);
            return (
              <button
                key={index}
                onClick={() => game.makeMove(index)}
                disabled={cell !== null || game.status !== 'playing' || (vsComputer && game.currentPlayer !== playerSymbol)}
                className={`${cellSize} flex items-center justify-center rounded-lg font-bold transition-all duration-150 ${
                  cell === null && game.status === 'playing'
                    ? 'bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 hover:scale-105 cursor-pointer'
                    : 'bg-gray-50 dark:bg-gray-700'
                } ${
                  isWinCell ? 'bg-green-200 dark:bg-green-800 scale-110 ring-2 ring-green-400' : ''
                } ${cell === 'X' ? 'text-blue-500' : 'text-purple-500'}`}
              >
                {cell === 'X' && '✕'}
                {cell === 'O' && '○'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      {game.status !== 'playing' && (
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleNewGame}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            🔄 Ещё раз
          </button>
          <button
            onClick={handleBackToMenu}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl shadow-lg transition-all"
          >
            ⚙️ Настройки
          </button>
        </div>
      )}
    </div>
  );
}
