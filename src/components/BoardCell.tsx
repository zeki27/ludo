import React from 'react';
import { GameState } from '../types/game';

interface BoardCellProps {
  row: number;
  col: number;
  gameState: GameState;
  onTokenClick: (tokenId: number) => void;
}

export function BoardCell({ row, col, gameState, onTokenClick }: BoardCellProps) {
  // This is a simplified board representation
  // In a full implementation, you'd map the logical board positions to the grid
  
  const isHomeArea = (row >= 1 && row <= 5 && col >= 1 && col <= 5) ||
                     (row >= 1 && row <= 5 && col >= 9 && col <= 13) ||
                     (row >= 9 && row <= 13 && col >= 1 && col <= 5) ||
                     (row >= 9 && row <= 13 && col >= 9 && col <= 13);

  const isPlayArea = (row === 6 && col >= 1 && col <= 13) ||
                     (row === 7 && (col <= 5 || col >= 9)) ||
                     (row === 8 && (col <= 5 || col >= 9)) ||
                     (col === 6 && row >= 1 && row <= 13) ||
                     ((col === 7 || col === 8) && (row <= 5 || row >= 9));

  const isSafeSpot = (row === 6 && col === 2) ||
                     (row === 2 && col === 8) ||
                     (row === 8 && col === 12) ||
                     (row === 12 && col === 6);

  const cellClass = isHomeArea 
    ? 'bg-gray-200 border border-gray-300'
    : isPlayArea
      ? isSafeSpot 
        ? 'bg-yellow-200 border border-yellow-400'
        : 'bg-white border border-gray-400'
      : 'bg-green-100 border border-green-300';

  // Find tokens at this position (simplified logic)
  const tokensHere = gameState.players.flatMap(player => 
    player.tokens.map((token, tokenIndex) => ({
      ...token,
      playerId: player.id,
      playerColor: player.color,
      tokenIndex
    }))
  ).filter(token => {
    // This would need proper position mapping logic
    return false; // Placeholder
  });

  return (
    <div className={`
      w-6 h-6 sm:w-8 sm:h-8 ${cellClass} relative flex items-center justify-center
      transition-all duration-200 hover:shadow-md
    `}>
      {tokensHere.map((token, index) => (
        <button
          key={`${token.playerId}-${token.tokenIndex}`}
          onClick={() => onTokenClick(token.tokenIndex)}
          className={`
            w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white shadow-sm
            bg-${token.playerColor}-500 hover:scale-110 transition-transform
            absolute z-10
          `}
          style={{
            transform: `translate(${(index % 2) * 6 - 3}px, ${Math.floor(index / 2) * 6 - 3}px)`
          }}
        />
      ))}
    </div>
  );
}