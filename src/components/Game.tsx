import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGame, getWinLength, getRulesDescription } from '../hooks/useGame';
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

  // Auto-save when game ends
  React.useEffect(() => {
    if (game.status !== 'playing' && game.moveCount > 0 && user && !resultSavedRef.current) {
      resultSavedRef.current = true;
      const winnerSymbol = game.winInfo?.winner || 'draw';
      saveGameResult({
        id: crypto.randomUUID(),
        userId: user.id,
        username: user.username,
        boardSize,
        durationSeconds: game.timer,
        winner: winnerSymbol as 'X' | 'O' | 'draw',
        playerSymbol,
        timestamp: new Date().toISOString(),
      });
      onGameEnd();
    }
  }, [game.status, game.moveCount, user, boardSize, game.timer, playerSymbol, game.winInfo, onGameEnd]);

  const handleStartGame = () => {
    audioService.playClick();
    resultSavedRef.current = false;
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

  // ============== GAME SETTINGS SCREEN ==============
  if (!gameStarted) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 animate-fade-in">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl shadow-blue-500/30 mb-4">
              <span className="text-4xl">🎮</span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Настройки игры
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Выберите параметры и начните сражение!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Board Size Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <span className="text-xl">📐</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Размер поля</h3>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[3, 4, 5, 6, 7].map(size => (
                  <button
                    key={size}
                    onClick={() => { setBoardSize(size); audioService.playClick(); }}
                    className={`relative py-3 rounded-xl font-bold transition-all duration-200 ${
                      boardSize === size
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105'
                    }`}
                  >
                    {size}×{size}
                    {boardSize === size && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                        <span className="text-[8px]">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  📏 Правило: {getRulesDescription(boardSize)}
                </p>
              </div>
            </div>

            {/* Player Symbol Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                  <span className="text-xl">✏️</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ваш символ</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setPlayerSymbol('X'); audioService.playClick(); }}
                  className={`relative py-6 rounded-xl font-black text-3xl transition-all duration-200 ${
                    playerSymbol === 'X'
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105'
                  }`}
                >
                  ✕
                  {playerSymbol === 'X' && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center text-xs">✓</div>
                  )}
                </button>
                <button
                  onClick={() => { setPlayerSymbol('O'); audioService.playClick(); }}
                  className={`relative py-6 rounded-xl font-black text-3xl transition-all duration-200 ${
                    playerSymbol === 'O'
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105'
                  }`}
                >
                  ○
                  {playerSymbol === 'O' && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center text-xs">✓</div>
                  )}
                </button>
              </div>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                {playerSymbol === 'X' ? 'Вы ходите первым' : 'Компьютер ходит первым'}
              </p>
            </div>

            {/* Game Mode Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-shadow md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                  <span className="text-xl">🎯</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Режим игры</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setVsComputer(true); audioService.playClick(); }}
                  className={`relative py-5 rounded-xl font-semibold transition-all duration-200 ${
                    vsComputer
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 scale-[1.02]'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-1">🤖</div>
                  <div>vs Компьютер</div>
                  {vsComputer && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-green-500 text-xs font-bold">✓</div>
                  )}
                </button>
                <button
                  onClick={() => { setVsComputer(false); audioService.playClick(); }}
                  className={`relative py-5 rounded-xl font-semibold transition-all duration-200 ${
                    !vsComputer
                      ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 scale-[1.02]'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-1">👥</div>
                  <div>2 Игрока</div>
                  {!vsComputer && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-orange-500 text-xs font-bold">✓</div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="mt-8">
            <button
              onClick={handleStartGame}
              className="w-full py-5 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-black text-xl rounded-2xl shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]"
            >
              🚀 Начать сражение!
            </button>
          </div>

          {/* Rules info */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span>📖</span> Правила для разных полей
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[3, 4, 5, 6, 7].map(size => (
                <div key={size} className={`p-2 rounded-lg text-center ${size === boardSize ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                  <div className="font-bold text-gray-900 dark:text-white text-sm">{size}×{size}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{getWinLength(size)} в ряд</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============== GAME SCREEN ==============
  const cellSize = boardSize <= 4 ? 'w-16 h-16 text-3xl' : boardSize <= 5 ? 'w-14 h-14 text-2xl' : 'w-11 h-11 text-xl';

  // Determine who won
  const winnerSymbol = game.winInfo?.winner;
  const isPlayerWinner = winnerSymbol === playerSymbol;
  const isComputerWinner = vsComputer && winnerSymbol !== playerSymbol && winnerSymbol;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center p-4">
      {/* Header bar */}
      <div className="w-full max-w-lg mb-4">
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
          <button
            onClick={handleBackToMenu}
            className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors font-medium text-sm"
          >
            <span>←</span> Меню
          </button>
          <div className="text-center">
            <div className="text-2xl font-mono font-black text-gray-900 dark:text-white">
              ⏱ {formatTime(game.timer)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {boardSize}×{boardSize} • {getWinLength(boardSize)} в ряд
            </div>
          </div>
          <button
            onClick={toggleSound}
            className="text-xl hover:scale-110 transition-transform"
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </div>

      {/* ============== RESULT OVERLAY ============== */}
      {game.status !== 'playing' && (
        <div className="w-full max-w-lg mb-4 animate-scale-in">
          {/* WIN */}
          {game.status === 'won' && (
            <div className="relative overflow-hidden bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 rounded-3xl p-6 shadow-2xl shadow-green-500/30">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-2 left-4 text-4xl animate-bounce" style={{animationDelay: '0s'}}>🎉</div>
                <div className="absolute top-4 right-8 text-3xl animate-bounce" style={{animationDelay: '0.2s'}}>✨</div>
                <div className="absolute bottom-2 left-12 text-3xl animate-bounce" style={{animationDelay: '0.4s'}}>🏆</div>
                <div className="absolute bottom-4 right-4 text-4xl animate-bounce" style={{animationDelay: '0.1s'}}>⭐</div>
              </div>
              <div className="relative text-center">
                <div className="text-6xl mb-2">🏆</div>
                <h2 className="text-3xl font-black text-white mb-1">ПОБЕДА!</h2>
                <p className="text-green-100 text-lg font-medium">
                  Символ <span className="inline-flex items-center justify-center w-8 h-8 bg-white/30 rounded-lg font-black mx-1">
                    {winnerSymbol === 'X' ? '✕' : '○'}
                  </span> одержал победу!
                </p>
                <p className="text-green-100/80 text-sm mt-2">
                  Время: {formatTime(game.timer)} • Поле: {boardSize}×{boardSize}
                </p>
              </div>
            </div>
          )}

          {/* LOSS */}
          {game.status === 'lost' && (
            <div className="relative overflow-hidden bg-gradient-to-br from-red-400 via-rose-500 to-pink-600 rounded-3xl p-6 shadow-2xl shadow-red-500/30">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-3 left-6 text-3xl">💔</div>
                <div className="absolute top-2 right-8 text-3xl">😢</div>
                <div className="absolute bottom-3 left-10 text-3xl">💫</div>
              </div>
              <div className="relative text-center">
                <div className="text-6xl mb-2">😔</div>
                <h2 className="text-3xl font-black text-white mb-1">ПОРАЖЕНИЕ</h2>
                <p className="text-red-100 text-lg font-medium">
                  Победил символ <span className="inline-flex items-center justify-center w-8 h-8 bg-white/30 rounded-lg font-black mx-1">
                    {winnerSymbol === 'X' ? '✕' : '○'}
                  </span>
                </p>
                {vsComputer && (
                  <p className="text-red-100/80 text-sm mt-2">
                    Компьютер оказался сильнее. Попробуйте ещё раз!
                  </p>
                )}
                <p className="text-red-100/80 text-sm mt-1">
                  Время: {formatTime(game.timer)} • Поле: {boardSize}×{boardSize}
                </p>
              </div>
            </div>
          )}

          {/* DRAW */}
          {game.status === 'draw' && (
            <div className="relative overflow-hidden bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 rounded-3xl p-6 shadow-2xl shadow-amber-500/30">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-3 left-6 text-3xl animate-pulse">🤝</div>
                <div className="absolute top-2 right-8 text-3xl animate-pulse">⚡</div>
                <div className="absolute bottom-3 left-10 text-3xl animate-pulse">🎭</div>
              </div>
              <div className="relative text-center">
                <div className="text-6xl mb-2">🤝</div>
                <h2 className="text-3xl font-black text-white mb-1">НИЧЬЯ!</h2>
                <p className="text-amber-100 text-lg font-medium">
                  Достойная битва! Никто не победил.
                </p>
                <p className="text-amber-100/80 text-sm mt-2">
                  Время: {formatTime(game.timer)} • Поле: {boardSize}×{boardSize}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status indicator (during play) */}
      {game.status === 'playing' && (
        <div className="mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl px-6 py-3 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl ${
              game.currentPlayer === 'X' 
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' 
                : 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400'
            }`}>
              {game.currentPlayer === 'X' ? '✕' : '○'}
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-white">
                {vsComputer 
                  ? (game.currentPlayer === playerSymbol ? 'Ваш ход' : 'Ход компьютера...')
                  : `Ход игрока ${game.currentPlayer === 'X' ? '✕' : '○'}`
                }
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {vsComputer && game.currentPlayer !== playerSymbol && (
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    Думает...
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Board */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 sm:p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
        <div
          className="grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${boardSize}, 1fr)` }}
        >
          {game.board.map((cell, index) => {
            const isWinCell = game.winInfo?.line.includes(index);
            const isDisabled = cell !== null || game.status !== 'playing' || (vsComputer && game.currentPlayer !== playerSymbol);
            return (
              <button
                key={index}
                onClick={() => game.makeMove(index)}
                disabled={isDisabled}
                className={`${cellSize} flex items-center justify-center rounded-xl font-black transition-all duration-200 ${
                  cell === null && game.status === 'playing' && !isDisabled
                    ? 'bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:scale-110 cursor-pointer active:scale-95 border-2 border-gray-100 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600'
                    : 'bg-gray-50 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600'
                } ${
                  isWinCell 
                    ? 'bg-gradient-to-br from-green-300 to-emerald-400 dark:from-green-600 dark:to-emerald-700 scale-110 ring-2 ring-green-400 dark:ring-green-500 shadow-lg shadow-green-500/30 border-green-400 dark:border-green-500' 
                    : ''
                } ${cell === 'X' ? 'text-blue-500 dark:text-blue-400' : 'text-purple-500 dark:text-purple-400'}`}
              >
                {cell === 'X' && <span className="animate-scale-in">✕</span>}
                {cell === 'O' && <span className="animate-scale-in">○</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions after game ends */}
      {game.status !== 'playing' && (
        <div className="mt-6 flex gap-3 animate-fade-in">
          <button
            onClick={handleNewGame}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95"
          >
            🔄 Ещё раз
          </button>
          <button
            onClick={handleBackToMenu}
            className="px-6 py-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95"
          >
            ⚙️ Настройки
          </button>
        </div>
      )}
    </div>
  );
}
