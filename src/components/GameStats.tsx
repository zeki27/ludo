import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Target, TrendingUp, Calendar } from 'lucide-react';

interface GameStatsProps {
  userId: string;
  onBack: () => void;
}

interface UserStats {
  games_played: number;
  games_won: number;
  games_lost: number;
}

export function GameStats({ userId, onBack }: GameStatsProps) {
  const [stats, setStats] = useState<UserStats>({ games_played: 0, games_won: 0, games_lost: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/user/${userId}/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const winRate = stats.games_played > 0 ? Math.round((stats.games_won / stats.games_played) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-400 p-4 flex items-center justify-center">
        <div className="text-white text-lg">Loading stats...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-400 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-white">Game Statistics</h1>
        </div>

        {/* Stats Cards */}
        <div className="space-y-4">
          {/* Games Played */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Target size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{stats.games_played}</h3>
                <p className="text-gray-600">Games Played</p>
              </div>
            </div>
          </div>

          {/* Games Won */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <Trophy size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{stats.games_won}</h3>
                <p className="text-gray-600">Games Won</p>
              </div>
            </div>
          </div>

          {/* Win Rate */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <TrendingUp size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{winRate}%</h3>
                <p className="text-gray-600">Win Rate</p>
              </div>
            </div>
          </div>

          {/* Games Lost */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                <Calendar size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{stats.games_lost}</h3>
                <p className="text-gray-600">Games Lost</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        {stats.games_played > 0 && (
          <div className="mt-6 bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Insights</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Experience Level:</span>
                <span className="font-semibold text-gray-800">
                  {stats.games_played < 5 ? 'Beginner' : 
                   stats.games_played < 20 ? 'Intermediate' : 
                   stats.games_played < 50 ? 'Advanced' : 'Expert'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Skill Rating:</span>
                <span className="font-semibold text-gray-800">
                  {winRate >= 70 ? 'Excellent' :
                   winRate >= 50 ? 'Good' :
                   winRate >= 30 ? 'Average' : 'Improving'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Encouragement Message */}
        <div className="mt-6 text-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-white">
            {stats.games_played === 0 ? (
              <p>Start playing to build your statistics! 🎮</p>
            ) : winRate >= 50 ? (
              <p>Great job! You're doing amazing! 🏆</p>
            ) : (
              <p>Keep playing and improve your skills! 💪</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}