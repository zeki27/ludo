import React, { useState } from 'react';
import { Users, Zap, BarChart3, Settings, Copy, Share2 } from 'lucide-react';
import { GameState } from '../types/game';

interface GameLobbyProps {
  onCreateGame: () => void;
  onJoinQuickMatch: () => void;
  onViewStats: () => void;
  gameState: GameState | null;
  socket: any;
  userId: string;
}

export function GameLobby({ onCreateGame, onJoinQuickMatch, onViewStats, gameState, socket, userId }: GameLobbyProps) {
  const [gameCode, setGameCode] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);

  const handleJoinWithCode = () => {
    if (socket && gameCode.trim()) {
      // First try to find game by code (simplified - would need API call)
      socket.emit('join-game-by-code', { code: gameCode.trim().toUpperCase(), userId });
      setShowJoinModal(false);
      setGameCode('');
    }
  };

  const copyGameCode = () => {
    if (gameState?.code) {
      navigator.clipboard.writeText(gameState.code);
      // Could add toast notification here
    }
  };

  const shareGame = () => {
    if (gameState?.code) {
      const shareText = `Join my Ludo game! Code: ${gameState.code}`;
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(shareText)}`;
      window.open(shareUrl, '_blank');
    }
  };

  // If in a waiting room
  if (gameState && gameState.status === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">🎲 Waiting Room</h1>
              <p className="text-gray-600">Waiting for players to join...</p>
            </div>

            {/* Game Info */}
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">Game Code:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg bg-white px-3 py-1 rounded-lg">
                    {gameState.code || 'N/A'}
                  </span>
                  {gameState.code && (
                    <>
                      <button
                        onClick={copyGameCode}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={shareGame}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        <Share2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Share this code with friends to let them join!
              </div>
            </div>

            {/* Players List */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users size={20} />
                Players ({gameState.players.length}/4)
              </h3>
              <div className="space-y-2">
                {gameState.players.map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      player.id === userId ? 'bg-green-100' : 'bg-gray-100'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-${player.color}-500`}></div>
                    <span className="font-medium">
                      {player.id === userId ? 'You' : `Player ${index + 1}`}
                    </span>
                    <span className="text-sm text-gray-500 capitalize">({player.color})</span>
                  </div>
                ))}
                {Array.from({ length: 4 - gameState.players.length }).map((_, index) => (
                  <div key={`empty-${index}`} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border-2 border-dashed border-gray-300">
                    <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                    <span className="text-gray-400">Waiting for player...</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="text-center text-sm text-gray-600">
              {gameState.players.length >= 2 
                ? "Game will start soon!" 
                : `Need ${2 - gameState.players.length} more players to start`
              }
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main lobby
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎲 Ludo</h1>
          <p className="text-white/80">Play the classic board game with friends!</p>
        </div>

        {/* Main Menu */}
        <div className="space-y-4">
          {/* Quick Match */}
          <button
            onClick={onJoinQuickMatch}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center justify-center gap-3">
              <Zap size={24} />
              <div>
                <div className="text-lg">Quick Match</div>
                <div className="text-sm opacity-90">Play with random players</div>
              </div>
            </div>
          </button>

          {/* Create Private Game */}
          <button
            onClick={onCreateGame}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-4 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center justify-center gap-3">
              <Users size={24} />
              <div>
                <div className="text-lg">Create Private Game</div>
                <div className="text-sm opacity-90">Invite friends with a code</div>
              </div>
            </div>
          </button>

          {/* Join Private Game */}
          <button
            onClick={() => setShowJoinModal(true)}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center justify-center gap-3">
              <Settings size={24} />
              <div>
                <div className="text-lg">Join Private Game</div>
                <div className="text-sm opacity-90">Enter a game code</div>
              </div>
            </div>
          </button>

          {/* View Stats */}
          <button
            onClick={onViewStats}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center justify-center gap-3">
              <BarChart3 size={24} />
              <div>
                <div className="text-lg">My Statistics</div>
                <div className="text-sm opacity-90">View your game history</div>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white/60 text-sm">
          Enjoy playing Ludo with friends! 🎮
        </div>
      </div>

      {/* Join Game Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Join Private Game</h2>
            <input
              type="text"
              placeholder="Enter game code"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase())}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 uppercase tracking-wider text-center"
              maxLength={6}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinWithCode}
                disabled={!gameCode.trim()}
                className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                Join Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}