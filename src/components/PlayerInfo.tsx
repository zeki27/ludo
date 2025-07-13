import React from 'react';
import { Crown, User } from 'lucide-react';
import { Player } from '../types/game';

interface PlayerInfoProps {
  player: Player;
  isCurrentPlayer: boolean;
  isMyPlayer: boolean;
}

export function PlayerInfo({ player, isCurrentPlayer, isMyPlayer }: PlayerInfoProps) {
  const getColorClasses = (color: string) => {
    const colorMap = {
      red: 'bg-red-500 border-red-600',
      blue: 'bg-blue-500 border-blue-600',
      green: 'bg-green-500 border-green-600',
      yellow: 'bg-yellow-500 border-yellow-600'
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-500 border-gray-600';
  };

  const tokensFinished = player.tokens.filter(token => token.isFinished).length;
  const tokensInPlay = player.tokens.filter(token => token.isInPlay && !token.isFinished).length;

  return (
    <div className={`
      bg-white/20 backdrop-blur-sm rounded-xl p-3 text-white transition-all duration-300
      ${isCurrentPlayer ? 'ring-2 ring-yellow-400 shadow-lg scale-105' : ''}
      ${isMyPlayer ? 'ring-2 ring-white/50' : ''}
    `}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-6 h-6 rounded-full border-2 ${getColorClasses(player.color)}`} />
        <div className="flex items-center gap-1">
          {isMyPlayer && <User size={14} />}
          {isCurrentPlayer && <Crown size={14} className="text-yellow-400" />}
        </div>
        <span className="font-medium text-sm capitalize">
          {isMyPlayer ? 'You' : player.color}
        </span>
      </div>
      
      <div className="text-xs space-y-1">
        <div className="flex justify-between">
          <span>Finished:</span>
          <span className="font-semibold">{tokensFinished}/4</span>
        </div>
        <div className="flex justify-between">
          <span>In Play:</span>
          <span className="font-semibold">{tokensInPlay}</span>
        </div>
        <div className={`text-center py-1 rounded text-xs font-medium ${
          player.isActive ? 'bg-green-500/30' : 'bg-red-500/30'
        }`}>
          {player.isActive ? 'Active' : 'Disconnected'}
        </div>
      </div>
    </div>
  );
}