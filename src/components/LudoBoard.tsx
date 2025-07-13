import React from 'react';
import { Dice6, ArrowLeft, Users, Clock } from 'lucide-react';
import { GameState } from '../types/game';
import { PlayerInfo } from './PlayerInfo';
import { DiceRoller } from './DiceRoller';
import { BoardCell } from './BoardCell';

interface LudoBoardProps {
  gameState: GameState;
  currentUserId: string;
  onRollDice: () => void;
  onMoveToken: (tokenId: number, steps: number) => void;
  onBack: () => void;
}

export function LudoBoard({ gameState, currentUserId, onRollDice, onMoveToken, onBack }: LudoBoardProps) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === currentUserId;
  const myPlayer = gameState.players.find(p => p.id === currentUserId);

  const renderBoard = () => {
    const board = [];
    
    // Main board structure (simplified for demo)
    for (let row = 0; row < 15; row++) {
      const boardRow = [];
      for (let col = 0; col < 15; col++) {
        const cellKey = `${row}-${col}`;
        boardRow.push(
          <BoardCell
            key={cellKey}
            row={row}
            col={col}
            gameState={gameState}
            onTokenClick={(tokenId) => {
              if (isMyTurn && gameState.diceValue > 0) {
                onMoveToken(tokenId, gameState.diceValue);
              }
            }}
          />
        );
      }
      board.push(
        <div key={row} className="flex">
          {boardRow}
        </div>
      );
    }
    
    return board;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white">
          <Users size={20} />
          {gameState.players.length}/4
        </div>
      </div>

      {/* Player Info Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {gameState.players.map((player, index) => (
          <PlayerInfo
            key={player.id}
            player={player}
            isCurrentPlayer={index === gameState.currentPlayerIndex}
            isMyPlayer={player.id === currentUserId}
          />
        ))}
      </div>

      {/* Main Game Area */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Board */}
        <div className="flex-1 flex justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-2xl">
            <div className="grid grid-cols-15 gap-0.5 max-w-md mx-auto">
              {renderBoard()}
            </div>
          </div>
        </div>

        {/* Game Controls */}
        <div className="lg:w-80 space-y-4">
          {/* Current Turn */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-white">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Clock size={20} />
              Current Turn
            </h3>
            <div className={`p-3 rounded-lg ${isMyTurn ? 'bg-green-500' : 'bg-gray-500'}`}>
              {isMyTurn ? 'Your Turn!' : `${currentPlayer?.color || 'Unknown'}'s Turn`}
            </div>
          </div>

          {/* Dice Roller */}
          {isMyTurn && (
            <DiceRoller
              diceValue={gameState.diceValue}
              canRoll={gameState.movesRemaining === 0}
              onRoll={onRollDice}
            />
          )}

          {/* Player Tokens Status */}
          {myPlayer && (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-white">
              <h3 className="font-semibold mb-2">Your Tokens</h3>
              <div className="grid grid-cols-2 gap-2">
                {myPlayer.tokens.map((token, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-lg text-center ${
                      token.isFinished 
                        ? 'bg-green-500' 
                        : token.isInPlay 
                          ? 'bg-blue-500' 
                          : 'bg-gray-500'
                    }`}
                  >
                    Token {index + 1}
                    <div className="text-xs">
                      {token.isFinished ? 'Finished' : token.isInPlay ? 'In Play' : 'Home'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Game Status */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-white">
            <h3 className="font-semibold mb-2">Game Info</h3>
            <div className="space-y-1 text-sm">
              <div>Status: {gameState.status}</div>
              <div>Players: {gameState.players.length}</div>
              {gameState.code && <div>Code: {gameState.code}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Game End Modal */}
      {gameState.status === 'finished' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
            {gameState.winner === currentUserId ? (
              <div className="text-green-600 mb-4">
                🎉 Congratulations! You won!
              </div>
            ) : (
              <div className="text-gray-600 mb-4">
                Game won by {gameState.players.find(p => p.id === gameState.winner)?.color || 'Unknown'}
              </div>
            )}
            <button
              onClick={onBack}
              className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Back to Lobby
            </button>
          </div>
        </div>
      )}
    </div>
  );
}