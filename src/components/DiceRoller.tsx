import React, { useState, useEffect } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

interface DiceRollerProps {
  diceValue: number;
  canRoll: boolean;
  onRoll: () => void;
}

export function DiceRoller({ diceValue, canRoll, onRoll }: DiceRollerProps) {
  const [isRolling, setIsRolling] = useState(false);

  const DiceIcon = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6][diceValue - 1] || Dice1;

  const handleRoll = () => {
    if (!canRoll) return;
    
    setIsRolling(true);
    onRoll();
    
    // Animation duration
    setTimeout(() => {
      setIsRolling(false);
    }, 1000);
  };

  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-white text-center">
      <h3 className="font-semibold mb-4">Roll Dice</h3>
      
      <div className="mb-4">
        <button
          onClick={handleRoll}
          disabled={!canRoll || isRolling}
          className={`
            w-20 h-20 rounded-xl flex items-center justify-center transition-all duration-300
            ${canRoll && !isRolling 
              ? 'bg-white text-gray-800 hover:bg-gray-100 hover:scale-110 shadow-lg cursor-pointer' 
              : 'bg-gray-500 text-gray-300 cursor-not-allowed'
            }
            ${isRolling ? 'animate-spin' : ''}
          `}
        >
          <DiceIcon size={40} />
        </button>
      </div>

      <div className="text-sm">
        {diceValue > 0 && (
          <div className="mb-2 font-semibold">
            You rolled: {diceValue}
          </div>
        )}
        <div className="text-white/70">
          {canRoll 
            ? 'Tap the dice to roll!' 
            : diceValue > 0 
              ? 'Move a token to continue'
              : 'Wait for your turn'
          }
        </div>
      </div>
    </div>
  );
}