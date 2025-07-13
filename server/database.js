import sqlite3 from 'sqlite3';
import { promisify } from 'util';

let db;

export async function initDatabase() {
  db = new sqlite3.Database('ludo_game.db');
  
  // Promisify database methods
  db.run = promisify(db.run.bind(db));
  db.get = promisify(db.get.bind(db));
  db.all = promisify(db.all.bind(db));

  // Create tables
  await db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT,
      games_played INTEGER DEFAULT 0,
      games_won INTEGER DEFAULT 0,
      games_lost INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_active DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE,
      type TEXT NOT NULL,
      status TEXT DEFAULT 'waiting',
      players TEXT,
      game_state TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS game_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id TEXT,
      user_id INTEGER,
      result TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Database initialized');
}

export async function createUser(userId, username) {
  try {
    await db.run(
      'INSERT OR REPLACE INTO users (id, username, last_active) VALUES (?, ?, CURRENT_TIMESTAMP)',
      [userId, username]
    );
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

export async function getUserStats(userId) {
  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    return user || { games_played: 0, games_won: 0, games_lost: 0 };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return { games_played: 0, games_won: 0, games_lost: 0 };
  }
}

export async function updateUserStats(userId, won) {
  try {
    if (won) {
      await db.run(
        'UPDATE users SET games_played = games_played + 1, games_won = games_won + 1, last_active = CURRENT_TIMESTAMP WHERE id = ?',
        [userId]
      );
    } else {
      await db.run(
        'UPDATE users SET games_played = games_played + 1, games_lost = games_lost + 1, last_active = CURRENT_TIMESTAMP WHERE id = ?',
        [userId]
      );
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
}

export async function saveGame(gameId, gameData) {
  try {
    await db.run(
      'INSERT OR REPLACE INTO games (id, code, type, status, players, game_state, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [gameData.id, gameData.code, gameData.type, gameData.status, JSON.stringify(gameData.players), JSON.stringify(gameData)]
    );
  } catch (error) {
    console.error('Error saving game:', error);
  }
}

export async function loadGame(gameId) {
  try {
    const game = await db.get('SELECT * FROM games WHERE id = ?', [gameId]);
    if (game) {
      return JSON.parse(game.game_state);
    }
    return null;
  } catch (error) {
    console.error('Error loading game:', error);
    return null;
  }
}

export async function recordGameResult(gameId, userId, result) {
  try {
    await db.run(
      'INSERT INTO game_history (game_id, user_id, result) VALUES (?, ?, ?)',
      [gameId, userId, result]
    );
  } catch (error) {
    console.error('Error recording game result:', error);
  }
}