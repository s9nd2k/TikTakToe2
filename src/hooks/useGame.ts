import { useState, useCallback, useRef, useEffect } from 'react';
import { audioService } from '../utils/audio';

export type CellValue = 'X' | 'O' | null;
export type GameStatus = 'playing' | 'won' | 'lost' | 'draw';

export interface WinInfo {
  winner: 'X' | 'O';
  line: number[];
}

interface GameState {
  board: CellValue[];
  boardSize: number;
  winLength: number;
  currentPlayer: 'X' | 'O';
  status: GameStatus;
  winInfo: WinInfo | null;
  moveCount: number;
}

// Universal win check for N×N board with K in a row
function checkWin(board: CellValue[], boardSize: number, k: number): WinInfo | null {
  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal ↘
    [1, -1],  // diagonal ↙
  ];

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const idx = row * boardSize + col;
      const cell = board[idx];
      if (!cell) continue;

      for (const [dr, dc] of directions) {
        const line: number[] = [idx];
        let valid = true;

        for (let step = 1; step < k; step++) {
          const newRow = row + dr * step;
          const newCol = col + dc * step;

          if (newRow < 0 || newRow >= boardSize || newCol < 0 || newCol >= boardSize) {
            valid = false;
            break;
          }

          const newIdx = newRow * boardSize + newCol;
          if (board[newIdx] !== cell) {
            valid = false;
            break;
          }
          line.push(newIdx);
        }

        if (valid && line.length === k) {
          return { winner: cell, line };
        }
      }
    }
  }
  return null;
}

// Determine win length based on board size
export function getWinLength(boardSize: number): number {
  switch (boardSize) {
    case 3: return 3;
    case 4: return 4;
    case 5: return 4;
    case 6: return 4;
    case 7: return 5;
    default: return 3;
  }
}

// Get rules description
export function getRulesDescription(boardSize: number): string {
  const winLen = getWinLength(boardSize);
  return `${winLen} в ряд для победы`;
}

// Simple AI for computer opponent
function getAIMove(board: CellValue[], boardSize: number, aiSymbol: 'X' | 'O', winLength: number): number {
  const emptyCells = board.map((cell, idx) => cell === null ? idx : -1).filter(idx => idx !== -1);
  if (emptyCells.length === 0) return -1;

  const humanSymbol = aiSymbol === 'X' ? 'O' : 'X';

  // Check if AI can win
  for (const idx of emptyCells) {
    const testBoard = [...board];
    testBoard[idx] = aiSymbol;
    if (checkWin(testBoard, boardSize, winLength)) return idx;
  }

  // Check if human can win (block)
  for (const idx of emptyCells) {
    const testBoard = [...board];
    testBoard[idx] = humanSymbol;
    if (checkWin(testBoard, boardSize, winLength)) return idx;
  }

  // For small boards, use center strategy
  if (boardSize <= 5) {
    const center = Math.floor(boardSize / 2);
    const centerIdx = center * boardSize + center;
    if (board[centerIdx] === null) return centerIdx;

    // Try corners
    const corners = [0, boardSize - 1, (boardSize - 1) * boardSize, boardSize * boardSize - 1];
    const availableCorners = corners.filter(c => board[c] === null);
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
  }

  // Random move with preference for cells near center
  const scored = emptyCells.map(idx => {
    const row = Math.floor(idx / boardSize);
    const col = idx % boardSize;
    const center = boardSize / 2;
    const dist = Math.abs(row - center) + Math.abs(col - center);
    return { idx, score: Math.random() * 3 - dist };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].idx;
}

export function useGame(boardSize: number = 3, playerSymbol: 'X' | 'O' = 'X', vsComputer: boolean = true) {
  const winLength = getWinLength(boardSize);

  const [gameState, setGameState] = useState<GameState>({
    board: Array(boardSize * boardSize).fill(null),
    boardSize,
    winLength,
    currentPlayer: 'X',
    status: 'playing',
    winInfo: null,
    moveCount: 0,
  });

  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const wl = getWinLength(boardSize);
    setGameState({
      board: Array(boardSize * boardSize).fill(null),
      boardSize,
      winLength: wl,
      currentPlayer: 'X',
      status: 'playing',
      winInfo: null,
      moveCount: 0,
    });
    setTimer(0);
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [boardSize]);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - timer * 1000;
      timerRef.current = window.setInterval(() => {
        setTimer(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 100);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const makeMove = useCallback((index: number) => {
    setGameState(prev => {
      if (prev.board[index] !== null || prev.status !== 'playing') return prev;

      const newBoard = [...prev.board];
      newBoard[index] = prev.currentPlayer;
      const newMoveCount = prev.moveCount + 1;

      // Start timer on first move
      if (newMoveCount === 1) {
        setIsRunning(true);
      }

      audioService.playMove(prev.currentPlayer);

      // Check win
      const winResult = checkWin(newBoard, prev.boardSize, prev.winLength);
      if (winResult) {
        const isPlayerWin = winResult.winner === playerSymbol;
        setIsRunning(false);
        setTimeout(() => {
          if (isPlayerWin) audioService.playWin();
          else audioService.playLose();
        }, 100);

        return {
          ...prev,
          board: newBoard,
          status: isPlayerWin ? 'won' : 'lost',
          winInfo: winResult,
          moveCount: newMoveCount,
        };
      }

      // Check draw
      if (newMoveCount === prev.boardSize * prev.boardSize) {
        setIsRunning(false);
        setTimeout(() => audioService.playDraw(), 100);
        return {
          ...prev,
          board: newBoard,
          status: 'draw',
          moveCount: newMoveCount,
        };
      }

      const nextPlayer = prev.currentPlayer === 'X' ? 'O' : 'X';

      // AI move
      if (vsComputer && nextPlayer !== playerSymbol) {
        setTimeout(() => {
          setGameState(current => {
            if (current.status !== 'playing') return current;
            const aiIdx = getAIMove(current.board, current.boardSize, nextPlayer, current.winLength);
            if (aiIdx === -1) return current;

            const aiBoard = [...current.board];
            aiBoard[aiIdx] = nextPlayer;
            audioService.playMove(nextPlayer);

            const aiWinResult = checkWin(aiBoard, current.boardSize, current.winLength);
            if (aiWinResult) {
              setIsRunning(false);
              setTimeout(() => audioService.playLose(), 100);
              return {
                ...current,
                board: aiBoard,
                status: 'lost',
                winInfo: aiWinResult,
                moveCount: current.moveCount + 1,
              };
            }

            if (current.moveCount + 1 === current.boardSize * current.boardSize) {
              setIsRunning(false);
              setTimeout(() => audioService.playDraw(), 100);
              return {
                ...current,
                board: aiBoard,
                status: 'draw',
                moveCount: current.moveCount + 1,
              };
            }

            return {
              ...current,
              board: aiBoard,
              currentPlayer: playerSymbol,
              moveCount: current.moveCount + 1,
            };
          });
        }, 300 + Math.random() * 200);
      }

      return {
        ...prev,
        board: newBoard,
        currentPlayer: vsComputer ? playerSymbol : nextPlayer,
        moveCount: newMoveCount,
      };
    });
  }, [boardSize, playerSymbol, vsComputer]);

  const resetGame = useCallback(() => {
    const wl = getWinLength(boardSize);
    setGameState({
      board: Array(boardSize * boardSize).fill(null),
      boardSize,
      winLength: wl,
      currentPlayer: 'X',
      status: 'playing',
      winInfo: null,
      moveCount: 0,
    });
    setTimer(0);
    setIsRunning(false);
  }, [boardSize]);

  return {
    ...gameState,
    timer,
    makeMove,
    resetGame,
  };
}
