import React, { useEffect, useState } from 'react';
import { LudoBoard } from './components/LudoBoard';
import { GameLobby } from './components/GameLobby';
import { GameStats } from './components/GameStats';
import { useWebApp } from './hooks/useWebApp';
import { useSocket } from './hooks/useSocket';
import { GameState, GameMode } from './types/game';

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string;
        ready: () => void;
        expand: () => void;
        MainButton: {
          setText: (text: string) => void;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
        };
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
        };
      };
    };
  }
}

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentView, setCurrentView] = useState<'lobby' | 'game' | 'stats'>('lobby');
  const [gameMode, setGameMode] = useState<GameMode>('private');
  const { webApp, userId } = useWebApp();
  const socket = useSocket();

  useEffect(() => {
    if (webApp) {
      webApp.ready();
      webApp.expand();
    }
  }, [webApp]);

  useEffect(() => {
    if (!socket) return;

    socket.on('game-update', (state: GameState) => {
      setGameState(state);
      if (state.status === 'playing') {
        setCurrentView('game');
      }
    });

    socket.on('game-started', (state: GameState) => {
      setGameState(state);
      setCurrentView('game');
    });

    socket.on('dice-rolled', (data: any) => {
      setGameState(data.gameState);
    });

    socket.on('token-moved', (data: any) => {
      setGameState(data.gameState);
    });

    socket.on('game-ended', (data: any) => {
      setGameState(data.gameState);
      // Show end game screen
    });

    socket.on('error', (error: any) => {
      console.error('Game error:', error);
      alert(error.message);
    });

    return () => {
      socket.off('game-update');
      socket.off('game-started');
      socket.off('dice-rolled');
      socket.off('token-moved');
      socket.off('game-ended');
      socket.off('error');
    };
  }, [socket]);

  const handleCreateGame = () => {
    if (socket && userId) {
      const gameId = new URLSearchParams(window.location.search).get('game');
      if (gameId) {
        socket.emit('join-game', { gameId, userId });
      } else {
        // Create new game logic
        setGameMode('private');
      }
    }
  };

  const handleJoinQuickMatch = () => {
    if (socket && userId) {
      socket.emit('join-quick-match', { userId });
      setGameMode('quick');
    }
  };

  const handleRollDice = () => {
    if (socket && gameState && userId) {
      socket.emit('roll-dice', { gameId: gameState.id, userId });
    }
  };

  const handleMoveToken = (tokenId: number, steps: number) => {
    if (socket && gameState && userId) {
      socket.emit('move-token', { gameId: gameState.id, userId, tokenId, steps });
    }
  };

  if (currentView === 'stats') {
    return (
      <GameStats
        userId={userId}
        onBack={() => setCurrentView('lobby')}
      />
    );
  }

  if (currentView === 'game' && gameState) {
    return (
      <LudoBoard
        gameState={gameState}
        currentUserId={userId}
        onRollDice={handleRollDice}
        onMoveToken={handleMoveToken}
        onBack={() => setCurrentView('lobby')}
      />
    );
  }

  return (
    <GameLobby
      onCreateGame={handleCreateGame}
      onJoinQuickMatch={handleJoinQuickMatch}
      onViewStats={() => setCurrentView('stats')}
      gameState={gameState}
      socket={socket}
      userId={userId}
    />
  );
}

export default App;