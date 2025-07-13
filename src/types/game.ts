export interface Token {
  id: number;
  position: number;
  isInPlay: boolean;
  isFinished: boolean;
}

export interface Player {
  id: string;
  socketId: string;
  color: string;
  position: number;
  tokens: Token[];
  isActive: boolean;
}

export interface GameState {
  id: string;
  type: string;
  code?: string;
  status: 'waiting' | 'playing' | 'finished';
  players: Player[];
  currentPlayerIndex: number;
  diceValue: number;
  movesRemaining: number;
  winner?: string;
  createdAt: Date;
}

export type GameMode = 'private' | 'quick';