export class LudoGame {
  constructor(id, type, code = null) {
    this.id = id;
    this.type = type; // 'private' or 'quick'
    this.code = code;
    this.status = 'waiting'; // 'waiting', 'playing', 'finished'
    this.players = [];
    this.currentPlayerIndex = 0;
    this.diceValue = 0;
    this.movesRemaining = 0;
    this.winner = null;
    this.createdAt = new Date();
    
    // Player colors
    this.colors = ['red', 'blue', 'green', 'yellow'];
    
    // Board configuration
    this.boardSize = 15;
    this.safeSpots = [1, 9, 14, 22, 27, 35, 40, 48];
    this.homeColumns = {
      red: [51, 52, 53, 54, 55],
      blue: [46, 47, 48, 49, 50],
      green: [41, 42, 43, 44, 45],
      yellow: [36, 37, 38, 39, 40]
    };
  }

  addPlayer(userId, socketId) {
    if (this.players.length >= 4 || this.status !== 'waiting') {
      return false;
    }

    // Check if player already exists
    if (this.players.find(p => p.id === userId)) {
      return false;
    }

    const player = {
      id: userId,
      socketId,
      color: this.colors[this.players.length],
      position: this.players.length,
      tokens: this.initializeTokens(this.colors[this.players.length]),
      isActive: true
    };

    this.players.push(player);
    return true;
  }

  initializeTokens(color) {
    const startPositions = {
      red: [0, 0, 0, 0],
      blue: [0, 0, 0, 0],
      green: [0, 0, 0, 0],
      yellow: [0, 0, 0, 0]
    };

    return Array.from({ length: 4 }, (_, index) => ({
      id: index,
      position: -1, // -1 means in home base
      isInPlay: false,
      isFinished: false
    }));
  }

  start() {
    if (this.players.length < 2) {
      return false;
    }

    this.status = 'playing';
    this.currentPlayerIndex = 0;
    return true;
  }

  rollDice(userId) {
    if (this.status !== 'playing') {
      return { success: false, error: 'Game not in progress' };
    }

    const currentPlayer = this.players[this.currentPlayerIndex];
    if (currentPlayer.id !== userId) {
      return { success: false, error: 'Not your turn' };
    }

    if (this.movesRemaining > 0) {
      return { success: false, error: 'You must move a token first' };
    }

    this.diceValue = Math.floor(Math.random() * 6) + 1;
    this.movesRemaining = 1;

    return {
      success: true,
      diceValue: this.diceValue
    };
  }

  moveToken(userId, tokenId, steps) {
    if (this.status !== 'playing') {
      return { success: false, error: 'Game not in progress' };
    }

    const currentPlayer = this.players[this.currentPlayerIndex];
    if (currentPlayer.id !== userId) {
      return { success: false, error: 'Not your turn' };
    }

    if (this.movesRemaining === 0) {
      return { success: false, error: 'Roll dice first' };
    }

    if (steps !== this.diceValue) {
      return { success: false, error: 'Invalid move distance' };
    }

    const token = currentPlayer.tokens[tokenId];
    if (!token) {
      return { success: false, error: 'Invalid token' };
    }

    // Check if move is valid
    if (!this.isValidMove(currentPlayer, token, steps)) {
      return { success: false, error: 'Invalid move' };
    }

    // Execute the move
    this.executeMove(currentPlayer, token, steps);

    // Decrease moves remaining
    this.movesRemaining--;

    // Check for win condition
    if (this.checkWinCondition(currentPlayer)) {
      this.status = 'finished';
      this.winner = currentPlayer.id;
    }

    // Check if player gets another turn (rolled 6)
    if (this.diceValue !== 6 && this.movesRemaining === 0) {
      this.nextTurn();
    }

    return { success: true };
  }

  isValidMove(player, token, steps) {
    // Can't move finished tokens
    if (token.isFinished) {
      return false;
    }

    // Token in base - can only move with 6
    if (token.position === -1) {
      return steps === 6;
    }

    // Check if move would go beyond finish
    const newPosition = token.position + steps;
    const maxPosition = this.getMaxPosition(player.color);
    
    return newPosition <= maxPosition;
  }

  executeMove(player, token, steps) {
    if (token.position === -1) {
      // Move from base to start position
      token.position = this.getStartPosition(player.color);
      token.isInPlay = true;
    } else {
      // Normal move
      const newPosition = token.position + steps;
      
      // Check if entering home column
      if (this.isEnteringHomeColumn(player.color, token.position, newPosition)) {
        token.position = this.getHomeColumnStart(player.color);
      } else {
        token.position = newPosition % 52; // 52 squares on the board
      }

      // Check if finished
      if (this.isInFinishPosition(player.color, token.position)) {
        token.isFinished = true;
      }
    }

    // Check for captures
    this.checkCaptures(player, token);
  }

  checkCaptures(movingPlayer, movingToken) {
    // Skip if in safe spot
    if (this.safeSpots.includes(movingToken.position)) {
      return;
    }

    // Check all other players' tokens
    for (const player of this.players) {
      if (player.id === movingPlayer.id) continue;

      for (const token of player.tokens) {
        if (token.position === movingToken.position && token.isInPlay && !token.isFinished) {
          // Capture the token
          token.position = -1;
          token.isInPlay = false;
        }
      }
    }
  }

  getStartPosition(color) {
    const startPositions = {
      red: 1,
      blue: 14,
      green: 27,
      yellow: 40
    };
    return startPositions[color];
  }

  getMaxPosition(color) {
    return 51 + 5; // 52 board squares + 5 home column squares
  }

  isEnteringHomeColumn(color, oldPosition, newPosition) {
    const homeEntrances = {
      red: 51,
      blue: 12,
      green: 25,
      yellow: 38
    };
    
    return oldPosition < homeEntrances[color] && newPosition >= homeEntrances[color];
  }

  getHomeColumnStart(color) {
    const homeStarts = {
      red: 52,
      blue: 57,
      green: 62,
      yellow: 67
    };
    return homeStarts[color];
  }

  isInFinishPosition(color, position) {
    const finishPositions = {
      red: 56,
      blue: 61,
      green: 66,
      yellow: 71
    };
    return position === finishPositions[color];
  }

  checkWinCondition(player) {
    return player.tokens.every(token => token.isFinished);
  }

  nextTurn() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    this.diceValue = 0;
  }

  handlePlayerDisconnect(userId) {
    const player = this.players.find(p => p.id === userId);
    if (player) {
      player.isActive = false;
    }

    // Check if game should continue
    const activePlayers = this.players.filter(p => p.isActive);
    if (activePlayers.length < 2 && this.status === 'playing') {
      this.status = 'finished';
      if (activePlayers.length === 1) {
        this.winner = activePlayers[0].id;
      }
    }
  }

  getGameState() {
    return {
      id: this.id,
      type: this.type,
      code: this.code,
      status: this.status,
      players: this.players,
      currentPlayerIndex: this.currentPlayerIndex,
      diceValue: this.diceValue,
      movesRemaining: this.movesRemaining,
      winner: this.winner,
      createdAt: this.createdAt
    };
  }
}