"use client";

import { useState, useEffect } from "react";

interface GameState {
  respectPoints: number;
  clickValue: number;
  rank: string;
  passiveIncome: number;
  upgrades: {
    equipment: number;
    training: number;
    partner: number;
  };
}

const RANKS = [
  { name: "Beat Cop", requirement: 0 },
  { name: "Detective", requirement: 100 },
  { name: "Sergeant", requirement: 500 }, 
  { name: "Lieutenant", requirement: 2000 },
  { name: "Captain", requirement: 10000 },
  { name: "Chief", requirement: 50000 }
];

export default function Home() {
  const [gameState, setGameState] = useState<GameState>({
    respectPoints: 0,
    clickValue: 1,
    rank: RANKS[0].name,
    passiveIncome: 0,
    upgrades: {
      equipment: 0,
      training: 0,
      partner: 0
    }
  });

  const [clickAnimations, setClickAnimations] = useState<Array<{id: number, x: number, y: number}>>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedGame = localStorage.getItem('cop-clicker-save');
    if (savedGame) {
      try {
        setGameState(JSON.parse(savedGame));
      } catch (e) {
        console.error('Failed to load save:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const autoSave = setInterval(() => {
      localStorage.setItem('cop-clicker-save', JSON.stringify(gameState));
    }, 5000);

    return () => clearInterval(autoSave);
  }, [gameState]);

  useEffect(() => {
    if (gameState.passiveIncome > 0) {
      const passiveTimer = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          respectPoints: prev.respectPoints + prev.passiveIncome
        }));
      }, 1000);

      return () => clearInterval(passiveTimer);
    }
  }, [gameState.passiveIncome]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setGameState(prev => ({
      ...prev,
      respectPoints: prev.respectPoints + prev.clickValue
    }));

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newAnimation = {
      id: Date.now(),
      x,
      y
    };
    
    setClickAnimations(prev => [...prev, newAnimation]);
    
    setTimeout(() => {
      setClickAnimations(prev => prev.filter(anim => anim.id !== newAnimation.id));
    }, 1000);
  };

  const formatNumber = (num: number) => {
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return Math.floor(num).toString();
  };

  const getUpgradeCost = (upgradeType: string, currentLevel: number) => {
    const baseCosts = {
      equipment: 10,
      training: 50,
      partner: 100
    };
    return Math.floor(baseCosts[upgradeType as keyof typeof baseCosts] * Math.pow(1.5, currentLevel));
  };

  const getRankMultiplier = () => {
    if (!gameState?.rank) return 1;
    const rankIndex = RANKS.findIndex(rank => rank.name === gameState.rank);
    return rankIndex >= 0 ? 1 + (rankIndex * 0.25) : 1; // 25% bonus per rank
  };

  const buyUpgrade = (upgradeType: 'equipment' | 'training' | 'partner') => {
    const cost = getUpgradeCost(upgradeType, gameState.upgrades[upgradeType]);
    
    if (gameState.respectPoints >= cost) {
      setGameState(prev => {
        const newState = {
          ...prev,
          respectPoints: prev.respectPoints - cost,
          upgrades: {
            ...prev.upgrades,
            [upgradeType]: prev.upgrades[upgradeType] + 1
          }
        };

        const rankMultiplier = getRankMultiplier();

        if (upgradeType === 'equipment') {
          newState.clickValue = Math.floor((1 + newState.upgrades.equipment) * rankMultiplier);
        } else if (upgradeType === 'training') {
          newState.clickValue = Math.floor((1 + newState.upgrades.equipment + (newState.upgrades.training * 2)) * rankMultiplier);
        } else if (upgradeType === 'partner') {
          newState.passiveIncome = Math.floor(newState.upgrades.partner * rankMultiplier);
        }

        return newState;
      });
    }
  };

  const canAfford = (upgradeType: 'equipment' | 'training' | 'partner') => {
    if (!gameState?.upgrades) return false;
    return gameState.respectPoints >= getUpgradeCost(upgradeType, gameState.upgrades[upgradeType]);
  };

  const updateRank = () => {
    if (!gameState?.rank) return;
    const currentRankIndex = RANKS.findIndex(rank => rank.name === gameState.rank);
    const nextRankIndex = currentRankIndex + 1;
    
    if (nextRankIndex < RANKS.length && gameState.respectPoints >= RANKS[nextRankIndex].requirement) {
      setGameState(prev => {
        const newState = { ...prev, rank: RANKS[nextRankIndex].name };
        const rankMultiplier = 1 + (nextRankIndex * 0.25);
        
        // Recalculate values with new rank bonus
        newState.clickValue = Math.floor((1 + newState.upgrades.equipment + (newState.upgrades.training * 2)) * rankMultiplier);
        newState.passiveIncome = Math.floor(newState.upgrades.partner * rankMultiplier);
        
        return newState;
      });
    }
  };

  const getCurrentRankInfo = () => {
    if (!gameState?.rank) return { current: RANKS[0], next: RANKS[1], progress: 0 };
    const currentIndex = RANKS.findIndex(rank => rank.name === gameState.rank);
    const nextIndex = currentIndex + 1;
    
    return {
      current: RANKS[currentIndex] || RANKS[0],
      next: nextIndex < RANKS.length ? RANKS[nextIndex] : null,
      progress: nextIndex < RANKS.length 
        ? Math.min(100, (gameState.respectPoints / RANKS[nextIndex].requirement) * 100)
        : 100
    };
  };

  useEffect(() => {
    if (isLoaded) {
      updateRank();
    }
  }, [gameState.respectPoints, isLoaded]);

  // Memoize expensive calculations
  const rankMultiplier = getRankMultiplier();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white flex items-center justify-center">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Cop Clicker</h1>
          <p className="text-blue-200">Rise Through the Ranks</p>
        </header>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-blue-800/50 rounded-lg p-6 mb-6 backdrop-blur-sm border border-blue-600/30">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold mb-2">Current Rank: {gameState.rank}</h2>
                <div className="text-3xl font-mono">
                  {formatNumber(gameState.respectPoints)} Respect Points
                </div>
                <div className="text-lg text-blue-200 mt-2">
                  +{gameState.clickValue} per click
                  {gameState.passiveIncome > 0 && (
                    <div className="text-sm text-green-300">
                      +{gameState.passiveIncome} per second
                    </div>
                  )}
                  {rankMultiplier > 1 && (
                    <div className="text-sm text-yellow-300">
                      Rank Bonus: +{((rankMultiplier - 1) * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
                
                {(() => {
                  const rankInfo = getCurrentRankInfo();
                  return rankInfo.next ? (
                    <div className="mt-4">
                      <div className="text-sm text-blue-200 mb-2">
                        Next: {rankInfo.next.name} ({formatNumber(rankInfo.next.requirement)} RP)
                      </div>
                      <div className="w-full bg-blue-900/50 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${rankInfo.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-blue-300 mt-1">
                        {rankInfo.progress.toFixed(1)}% to promotion
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 text-yellow-300 font-bold">
                      🏆 Maximum Rank Achieved!
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleClick}
                className="relative bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-all duration-150 transform hover:scale-105 active:scale-95 rounded-full w-48 h-48 text-xl font-bold shadow-2xl border-4 border-blue-400 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent"></div>
                <div className="relative z-10">
                  🚔
                  <div className="text-sm mt-2">CLICK TO PATROL</div>
                </div>
                
                {clickAnimations.map(anim => (
                  <div
                    key={anim.id}
                    className="absolute pointer-events-none text-yellow-300 font-bold text-lg animate-ping"
                    style={{
                      left: anim.x - 10,
                      top: anim.y - 10,
                      animation: 'fadeUpOut 1s ease-out forwards'
                    }}
                  >
                    +{gameState.clickValue}
                  </div>
                ))}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-800/50 rounded-lg p-6 backdrop-blur-sm border border-blue-600/30">
              <h3 className="text-xl font-bold mb-4">Upgrades</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => buyUpgrade('equipment')}
                  disabled={!canAfford('equipment')}
                  className={`w-full text-left p-3 rounded border transition-colors ${
                    canAfford('equipment') 
                      ? 'bg-blue-700/50 hover:bg-blue-600/50 border-blue-500/30 cursor-pointer' 
                      : 'bg-gray-600/50 border-gray-500/30 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="font-semibold">Better Equipment ({gameState.upgrades.equipment})</div>
                  <div className="text-sm text-blue-200">+1 click value</div>
                  <div className="text-sm text-yellow-300">Cost: {formatNumber(getUpgradeCost('equipment', gameState.upgrades.equipment))} RP</div>
                </button>
                
                <button 
                  onClick={() => buyUpgrade('training')}
                  disabled={!canAfford('training')}
                  className={`w-full text-left p-3 rounded border transition-colors ${
                    canAfford('training') 
                      ? 'bg-blue-700/50 hover:bg-blue-600/50 border-blue-500/30 cursor-pointer' 
                      : 'bg-gray-600/50 border-gray-500/30 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="font-semibold">Training Course ({gameState.upgrades.training})</div>
                  <div className="text-sm text-blue-200">+2 click value</div>
                  <div className="text-sm text-yellow-300">Cost: {formatNumber(getUpgradeCost('training', gameState.upgrades.training))} RP</div>
                </button>
                
                <button 
                  onClick={() => buyUpgrade('partner')}
                  disabled={!canAfford('partner')}
                  className={`w-full text-left p-3 rounded border transition-colors ${
                    canAfford('partner') 
                      ? 'bg-blue-700/50 hover:bg-blue-600/50 border-blue-500/30 cursor-pointer' 
                      : 'bg-gray-600/50 border-gray-500/30 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="font-semibold">Partner Support ({gameState.upgrades.partner})</div>
                  <div className="text-sm text-blue-200">+1 RP/sec</div>
                  <div className="text-sm text-yellow-300">Cost: {formatNumber(getUpgradeCost('partner', gameState.upgrades.partner))} RP</div>
                </button>
              </div>
            </div>

            <div className="bg-blue-800/50 rounded-lg p-6 backdrop-blur-sm border border-blue-600/30">
              <h3 className="text-xl font-bold mb-4">Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total RP:</span>
                  <span>{formatNumber(gameState.respectPoints)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Rank:</span>
                  <span>{gameState.rank}</span>
                </div>
                <div className="flex justify-between">
                  <span>Click Power:</span>
                  <span>{gameState.clickValue}</span>
                </div>
                <div className="flex justify-between">
                  <span>Passive Income:</span>
                  <span>{gameState.passiveIncome}/sec</span>
                </div>
                <div className="flex justify-between">
                  <span>Equipment:</span>
                  <span>{gameState.upgrades.equipment}</span>
                </div>
                <div className="flex justify-between">
                  <span>Training:</span>
                  <span>{gameState.upgrades.training}</span>
                </div>
                <div className="flex justify-between">
                  <span>Partners:</span>
                  <span>{gameState.upgrades.partner}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeUpOut {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-50px);
          }
        }
      `}</style>
    </div>
  );
}
