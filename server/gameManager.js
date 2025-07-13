import { v4 as uuidv4 } from 'uuid';
import { LudoGame } from './gameLogic.js';
import { saveGame, updateUserStats, recordGameResult } from './database.js';

export class GameManager {
  constructor(io) {
    this.io = io;
    this.games = new Map();
    this.playerSockets = new Map();
    this.matchmaking = [];
  }

  generateGameCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  createPrivateGame(creatorId) {
    const gameId = uuidv4();
    const code = this.generateGameCode();
    
    const game = new LudoGame(gameId, 'private', code);
    this.games.set(gameId, game);
    
    return game;
  }

  async joinGame(socket, gameId, userId) {
    let game = this.games.get(gameId);
    
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    // Add player to game
    const playerAdded = game.addPlayer(userId, socket.id);
    if (!playerAdded) {
      socket.emit('error', { message: 'Cannot join game' });
      return;
    }

    // Store socket reference
    this.playerSockets.set(socket.id, { gameId, userId });
    socket.join(gameId);

    // Save game state
    await saveGame(gameId, game.getGameState());

    // Notify all players
    this.io.to(gameId).emit('game-update', game.getGameState());

    // Start game if we have enough players
    if (game.players.length >= 2 && game.status === 'waiting') {
      setTimeout(() => {
        if (game.players.length >= 2) {
          this.startGame(gameId);
        }
      }, 5000); // Wait 5 seconds for more players
    }
  }

  async startGame(gameId) {
    const game = this.games.get(gameId);
    if (!game) return;

    game.start();
    await saveGame(gameId, game.getGameState());
    
    this.io.to(gameId).emit('game-started', game.getGameState());
  }

  async rollDice(gameId, userId) {
    const game = this.games.get(gameId);
    if (!game) return;

    const result = game.rollDice(userId);
    if (result.success) {
      await saveGame(gameId, game.getGameState());
      this.io.to(gameId).emit('dice-rolled', {
        userId,
        diceValue: result.diceValue,
        gameState: game.getGameState()
      });

      // Check for game end
      if (game.status === 'finished') {
        await this.endGame(gameId);
      }
    } else {
      const playerSocket = this.getPlayerSocket(gameId, userId);
      if (playerSocket) {
        playerSocket.emit('error', { message: result.error });
      }
    }
  }

  async moveToken(gameId, userId, tokenId, steps) {
    const game = this.games.get(gameId);
    if (!game) return;

    const result = game.moveToken(userId, tokenId, steps);
    if (result.success) {
      await saveGame(gameId, game.getGameState());
      this.io.to(gameId).emit('token-moved', {
        userId,
        tokenId,
        steps,
        gameState: game.getGameState()
      });

      // Check for game end
      if (game.status === 'finished') {
        await this.endGame(gameId);
      }
    } else {
      const playerSocket = this.getPlayerSocket(gameId, userId);
      if (playerSocket) {
        playerSocket.emit('error', { message: result.error });
      }
    }
  }

  async endGame(gameId) {
    const game = this.games.get(gameId);
    if (!game) return;

    // Update player statistics
    const winner = game.winner;
    for (const player of game.players) {
      const won = player.id === winner;
      await updateUserStats(player.id, won);
      await recordGameResult(gameId, player.id, won ? 'won' : 'lost');
    }

    // Notify players
    this.io.to(gameId).emit('game-ended', {
      winner,
      gameState: game.getGameState()
    });

    // Clean up after 5 minutes
    setTimeout(() => {
      this.games.delete(gameId);
    }, 300000);
  }

  getPlayerSocket(gameId, userId) {
    for (const [socketId, data] of this.playerSockets) {
      if (data.gameId === gameId && data.userId === userId) {
        return this.io.sockets.sockets.get(socketId);
      }
    }
    return null;
  }

  handleDisconnect(socket) {
    const playerData = this.playerSockets.get(socket.id);
    if (playerData) {
      const { gameId, userId } = playerData;
      const game = this.games.get(gameId);
      
      if (game) {
        game.handlePlayerDisconnect(userId);
        this.io.to(gameId).emit('player-disconnected', { userId });
      }
      
      this.playerSockets.delete(socket.id);
    }
  }

  getGameByCode(code) {
    for (const game of this.games.values()) {
      if (game.code === code) {
        return game;
      }
    }
    return null;
  }

  // Quick match functionality
  async joinQuickMatch(socket, userId) {
    // Add to matchmaking queue
    this.matchmaking.push({ userId, socketId: socket.id });

    // Try to create a match
    if (this.matchmaking.length >= 2) {
      const players = this.matchmaking.splice(0, 4); // Take up to 4 players
      const gameId = uuidv4();
      const game = new LudoGame(gameId, 'quick');
      
      this.games.set(gameId, game);

      // Add all players to the game
      for (const player of players) {
        await this.joinGame(this.io.sockets.sockets.get(player.socketId), gameId, player.userId);
      }
    } else {
      socket.emit('matchmaking', { message: 'Looking for players...', position: this.matchmaking.length });
    }
  }
}