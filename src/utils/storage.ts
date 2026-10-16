// Database simulation using localStorage

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: string;
}

export interface GameResult {
  id: string;
  userId: string;
  username: string;
  boardSize: number;
  durationSeconds: number;
  winner: 'X' | 'O' | 'draw';
  playerSymbol: 'X' | 'O';
  timestamp: string;
}

export interface PlayerStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  bestTime3x3: number | null;
  bestTime5x5: number | null;
  bestTime7x7: number | null;
}

// Simple hash function for password (NOT for production - use bcrypt in real apps)
export function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36) + password.length.toString(36);
}

// User operations
export function getUsers(): User[] {
  const data = localStorage.getItem('ttt_users');
  return data ? JSON.parse(data) : [];
}

export function saveUsers(users: User[]): void {
  localStorage.setItem('ttt_users', JSON.stringify(users));
}

export function findUserByUsername(username: string): User | undefined {
  return getUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
}

export function createUser(username: string, password: string): User | null {
  if (findUserByUsername(username)) return null;
  const user: User = {
    id: crypto.randomUUID(),
    username,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString()
  };
  const users = getUsers();
  users.push(user);
  saveUsers(users);
  return user;
}

export function authenticateUser(username: string, password: string): User | null {
  const user = findUserByUsername(username);
  if (!user) return null;
  if (user.passwordHash !== hashPassword(password)) return null;
  return user;
}

// Session management
export function setSession(userId: string): void {
  localStorage.setItem('ttt_session', userId);
}

export function getSession(): string | null {
  return localStorage.getItem('ttt_session');
}

export function clearSession(): void {
  localStorage.removeItem('ttt_session');
}

// Game results
export function getGameResults(): GameResult[] {
  const data = localStorage.getItem('ttt_results');
  return data ? JSON.parse(data) : [];
}

export function saveGameResult(result: GameResult): void {
  const results = getGameResults();
  results.push(result);
  localStorage.setItem('ttt_results', JSON.stringify(results));
}

export function getUserResults(userId: string): GameResult[] {
  return getGameResults().filter(r => r.userId === userId);
}

export function getPlayerStats(userId: string): PlayerStats {
  const results = getUserResults(userId);
  const stats: PlayerStats = {
    totalGames: results.length,
    wins: results.filter(r => r.winner === r.playerSymbol).length,
    losses: results.filter(r => r.winner !== r.playerSymbol && r.winner !== 'draw').length,
    draws: results.filter(r => r.winner === 'draw').length,
    bestTime3x3: null,
    bestTime5x5: null,
    bestTime7x7: null,
  };

  const wins3x3 = results.filter(r => r.boardSize === 3 && r.winner === r.playerSymbol);
  const wins5x5 = results.filter(r => r.boardSize === 5 && r.winner === r.playerSymbol);
  const wins7x7 = results.filter(r => r.boardSize === 7 && r.winner === r.playerSymbol);

  if (wins3x3.length > 0) stats.bestTime3x3 = Math.min(...wins3x3.map(r => r.durationSeconds));
  if (wins5x5.length > 0) stats.bestTime5x5 = Math.min(...wins5x5.map(r => r.durationSeconds));
  if (wins7x7.length > 0) stats.bestTime7x7 = Math.min(...wins7x7.map(r => r.durationSeconds));

  return stats;
}

// Leaderboard
export interface LeaderboardEntry {
  username: string;
  boardSize: number;
  durationSeconds: number;
  timestamp: string;
}

export function getLeaderboard(boardSize: number, limit: number = 10): LeaderboardEntry[] {
  const results = getGameResults()
    .filter(r => r.boardSize === boardSize && r.winner === r.playerSymbol)
    .sort((a, b) => a.durationSeconds - b.durationSeconds)
    .slice(0, limit);

  return results.map(r => ({
    username: r.username,
    boardSize: r.boardSize,
    durationSeconds: r.durationSeconds,
    timestamp: r.timestamp
  }));
}

// Theme
export function getTheme(): 'light' | 'dark' {
  return (localStorage.getItem('ttt_theme') as 'light' | 'dark') || 'light';
}

export function setTheme(theme: 'light' | 'dark'): void {
  localStorage.setItem('ttt_theme', theme);
}

// Sound
export function getSoundEnabled(): boolean {
  const val = localStorage.getItem('ttt_sound');
  return val === null ? true : val === 'true';
}

export function setSoundEnabled(enabled: boolean): void {
  localStorage.setItem('ttt_sound', enabled.toString());
}
