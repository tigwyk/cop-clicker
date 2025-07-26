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
    patrol: number;
    investigation: number;
    precinct: number;
    automation: number;
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
      partner: 0,
      patrol: 0,
      investigation: 0,
      precinct: 0,
      automation: 0
    }
  });

  const [clickAnimations, setClickAnimations] = useState<Array<{id: number, x: number, y: number}>>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedGame = localStorage.getItem('cop-clicker-save');
    
    if (savedGame) {
      try {
        const loadedState = JSON.parse(savedGame);
        
        // Ensure all required properties exist
        if (!loadedState.upgrades) {
          loadedState.upgrades = { equipment: 0, training: 0, partner: 0, patrol: 0, investigation: 0, precinct: 0, automation: 0 };
        } else {
          // Add missing upgrade properties for backward compatibility
          if (loadedState.upgrades.patrol === undefined) loadedState.upgrades.patrol = 0;
          if (loadedState.upgrades.investigation === undefined) loadedState.upgrades.investigation = 0;
          if (loadedState.upgrades.precinct === undefined) loadedState.upgrades.precinct = 0;
          if (loadedState.upgrades.automation === undefined) loadedState.upgrades.automation = 0;
        }
        if (!loadedState.rank) {
          loadedState.rank = RANKS[0].name;
        }
        
        // Recalculate values to ensure consistency
        const rankIndex = RANKS.findIndex(rank => rank.name === loadedState.rank);
        const rankMultiplier = rankIndex >= 0 ? 1 + (rankIndex * 0.25) : 1;
        
        // Calculate click value
        const baseClickValue = 1;
        const equipmentBonus = loadedState.upgrades.equipment * 1;
        const trainingBonus = loadedState.upgrades.training * 2;
        loadedState.clickValue = Math.floor((baseClickValue + equipmentBonus + trainingBonus) * rankMultiplier);
        
        // Calculate passive income (much more generous)
        const partnerIncome = loadedState.upgrades.partner * 1;
        const patrolIncome = loadedState.upgrades.patrol * 3;
        const investigationIncome = loadedState.upgrades.investigation * 12;
        const precinctIncome = loadedState.upgrades.precinct * 50;
        const automationBonus = loadedState.upgrades.automation > 0 ? (1 + loadedState.upgrades.automation * 0.5) : 1;
        
        const totalPassiveIncome = (partnerIncome + patrolIncome + investigationIncome + precinctIncome) * automationBonus;
        loadedState.passiveIncome = Math.floor(totalPassiveIncome * rankMultiplier);
        
        setGameState(loadedState);
      } catch (e) {
        console.error('Failed to load save:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const autoSave = setInterval(() => {
        try {
          localStorage.setItem('cop-clicker-save', JSON.stringify(gameState));
        } catch (e) {
          console.error('Failed to save game:', e);
        }
      }, 5000);

      return () => clearInterval(autoSave);
    }
  }, [gameState, isLoaded]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isLoaded) {
        localStorage.setItem('cop-clicker-save', JSON.stringify(gameState));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [gameState, isLoaded]);

  useEffect(() => {
    if (isLoaded && gameState.passiveIncome > 0) {
      const passiveTimer = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          respectPoints: prev.respectPoints + prev.passiveIncome
        }));
      }, 1000);

      return () => clearInterval(passiveTimer);
    }
  }, [gameState.passiveIncome, isLoaded]);

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
      training: 25,
      partner: 15,      // Much cheaper for first passive income
      patrol: 50,
      investigation: 200,
      precinct: 1000,
      automation: 5000
    };
    
    const scalingFactors = {
      equipment: 1.4,   // Gentler scaling
      training: 1.6,
      partner: 1.3,     // Very gentle scaling for early passive
      patrol: 1.5,
      investigation: 1.7,
      precinct: 2.0,
      automation: 2.5
    };
    
    const baseCost = baseCosts[upgradeType as keyof typeof baseCosts] || 10;
    const scaling = scalingFactors[upgradeType as keyof typeof scalingFactors] || 1.5;
    
    return Math.floor(baseCost * Math.pow(scaling, currentLevel));
  };

  const getRankMultiplier = () => {
    if (!gameState?.rank) return 1;
    const rankIndex = RANKS.findIndex(rank => rank.name === gameState.rank);
    return rankIndex >= 0 ? 1 + (rankIndex * 0.25) : 1; // 25% bonus per rank
  };

  const saveGame = () => {
    try {
      localStorage.setItem('cop-clicker-save', JSON.stringify(gameState));
    } catch (e) {
      console.error('Failed to save game:', e);
    }
  };

  const resetGame = () => {
    if (confirm('Are you sure you want to reset your progress? This cannot be undone!')) {
      localStorage.removeItem('cop-clicker-save');
      setGameState({
        respectPoints: 0,
        clickValue: 1,
        rank: RANKS[0].name,
        passiveIncome: 0,
        upgrades: {
          equipment: 0,
          training: 0,
          partner: 0,
          patrol: 0,
          investigation: 0,
          precinct: 0,
          automation: 0
        }
      });
    }
  };

  const buyUpgrade = (upgradeType: 'equipment' | 'training' | 'partner' | 'patrol' | 'investigation' | 'precinct' | 'automation') => {
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

        // Calculate click value
        const baseClickValue = 1;
        const equipmentBonus = newState.upgrades.equipment * 1;
        const trainingBonus = newState.upgrades.training * 2;
        newState.clickValue = Math.floor((baseClickValue + equipmentBonus + trainingBonus) * rankMultiplier);
        
        // Calculate passive income (much more generous)
        const partnerIncome = newState.upgrades.partner * 1;
        const patrolIncome = newState.upgrades.patrol * 3;
        const investigationIncome = newState.upgrades.investigation * 12;
        const precinctIncome = newState.upgrades.precinct * 50;
        const automationBonus = newState.upgrades.automation > 0 ? (1 + newState.upgrades.automation * 0.5) : 1;
        
        const totalPassiveIncome = (partnerIncome + patrolIncome + investigationIncome + precinctIncome) * automationBonus;
        newState.passiveIncome = Math.floor(totalPassiveIncome * rankMultiplier);

        return newState;
      });
      
      // Save immediately after important actions
      setTimeout(() => saveGame(), 100);
    }
  };

  const canAfford = (upgradeType: 'equipment' | 'training' | 'partner' | 'patrol' | 'investigation' | 'precinct' | 'automation') => {
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
        const baseClickValue = 1;
        const equipmentBonus = newState.upgrades.equipment * 1;
        const trainingBonus = newState.upgrades.training * 2;
        newState.clickValue = Math.floor((baseClickValue + equipmentBonus + trainingBonus) * rankMultiplier);
        
        // Calculate passive income (much more generous)
        const partnerIncome = newState.upgrades.partner * 1;
        const patrolIncome = newState.upgrades.patrol * 3;
        const investigationIncome = newState.upgrades.investigation * 12;
        const precinctIncome = newState.upgrades.precinct * 50;
        const automationBonus = newState.upgrades.automation > 0 ? (1 + newState.upgrades.automation * 0.5) : 1;
        
        const totalPassiveIncome = (partnerIncome + patrolIncome + investigationIncome + precinctIncome) * automationBonus;
        newState.passiveIncome = Math.floor(totalPassiveIncome * rankMultiplier);
        
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
              <h3 className="text-xl font-bold mb-4">👤 Click Upgrades</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => buyUpgrade('equipment')}
                  disabled={!canAfford('equipment')}
                  className={`w-full text-left p-2 rounded border transition-colors ${
                    canAfford('equipment') 
                      ? 'bg-blue-700/50 hover:bg-blue-600/50 border-blue-500/30 cursor-pointer' 
                      : 'bg-gray-600/50 border-gray-500/30 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="font-semibold text-sm">🔧 Equipment ({gameState.upgrades.equipment})</div>
                  <div className="text-xs text-blue-200">+1 click value</div>
                  <div className="text-xs text-yellow-300">Cost: {formatNumber(getUpgradeCost('equipment', gameState.upgrades.equipment))} RP</div>
                </button>
                
                <button 
                  onClick={() => buyUpgrade('training')}
                  disabled={!canAfford('training')}
                  className={`w-full text-left p-2 rounded border transition-colors ${
                    canAfford('training') 
                      ? 'bg-blue-700/50 hover:bg-blue-600/50 border-blue-500/30 cursor-pointer' 
                      : 'bg-gray-600/50 border-gray-500/30 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="font-semibold text-sm">📚 Training ({gameState.upgrades.training})</div>
                  <div className="text-xs text-blue-200">+2 click value</div>
                  <div className="text-xs text-yellow-300">Cost: {formatNumber(getUpgradeCost('training', gameState.upgrades.training))} RP</div>
                </button>
              </div>
            </div>

            <div className="bg-green-800/50 rounded-lg p-6 backdrop-blur-sm border border-green-600/30">
              <h3 className="text-xl font-bold mb-4">💰 Passive Income</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => buyUpgrade('partner')}
                  disabled={!canAfford('partner')}
                  className={`w-full text-left p-2 rounded border transition-colors ${
                    canAfford('partner') 
                      ? 'bg-green-700/50 hover:bg-green-600/50 border-green-500/30 cursor-pointer' 
                      : 'bg-gray-600/50 border-gray-500/30 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="font-semibold text-sm">👮 Partner ({gameState.upgrades.partner})</div>
                  <div className="text-xs text-green-200">+1 RP/sec</div>
                  <div className="text-xs text-yellow-300">Cost: {formatNumber(getUpgradeCost('partner', gameState.upgrades.partner))} RP</div>
                </button>
                
                <button 
                  onClick={() => buyUpgrade('patrol')}
                  disabled={!canAfford('patrol')}
                  className={`w-full text-left p-2 rounded border transition-colors ${
                    canAfford('patrol') 
                      ? 'bg-green-700/50 hover:bg-green-600/50 border-green-500/30 cursor-pointer' 
                      : 'bg-gray-600/50 border-gray-500/30 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="font-semibold text-sm">🚗 Patrol Unit ({gameState.upgrades.patrol})</div>
                  <div className="text-xs text-green-200">+3 RP/sec</div>
                  <div className="text-xs text-yellow-300">Cost: {formatNumber(getUpgradeCost('patrol', gameState.upgrades.patrol))} RP</div>
                </button>
                
                <button 
                  onClick={() => buyUpgrade('investigation')}
                  disabled={!canAfford('investigation')}
                  className={`w-full text-left p-2 rounded border transition-colors ${
                    canAfford('investigation') 
                      ? 'bg-green-700/50 hover:bg-green-600/50 border-green-500/30 cursor-pointer' 
                      : 'bg-gray-600/50 border-gray-500/30 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="font-semibold text-sm">🔍 Investigation ({gameState.upgrades.investigation})</div>
                  <div className="text-xs text-green-200">+12 RP/sec</div>
                  <div className="text-xs text-yellow-300">Cost: {formatNumber(getUpgradeCost('investigation', gameState.upgrades.investigation))} RP</div>
                </button>
                
                <button 
                  onClick={() => buyUpgrade('precinct')}
                  disabled={!canAfford('precinct')}
                  className={`w-full text-left p-2 rounded border transition-colors ${
                    canAfford('precinct') 
                      ? 'bg-green-700/50 hover:bg-green-600/50 border-green-500/30 cursor-pointer' 
                      : 'bg-gray-600/50 border-gray-500/30 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="font-semibold text-sm">🏢 Precinct ({gameState.upgrades.precinct})</div>
                  <div className="text-xs text-green-200">+50 RP/sec</div>
                  <div className="text-xs text-yellow-300">Cost: {formatNumber(getUpgradeCost('precinct', gameState.upgrades.precinct))} RP</div>
                </button>
              </div>
            </div>

            <div className="bg-purple-800/50 rounded-lg p-6 backdrop-blur-sm border border-purple-600/30">
              <h3 className="text-xl font-bold mb-4">⚡ Automation</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => buyUpgrade('automation')}
                  disabled={!canAfford('automation')}
                  className={`w-full text-left p-2 rounded border transition-colors ${
                    canAfford('automation') 
                      ? 'bg-purple-700/50 hover:bg-purple-600/50 border-purple-500/30 cursor-pointer' 
                      : 'bg-gray-600/50 border-gray-500/30 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="font-semibold text-sm">🤖 AI System ({gameState.upgrades.automation})</div>
                  <div className="text-xs text-purple-200">+50% passive income</div>
                  <div className="text-xs text-yellow-300">Cost: {formatNumber(getUpgradeCost('automation', gameState.upgrades.automation))} RP</div>
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
                  <span>🔧 Equipment:</span>
                  <span>{gameState.upgrades.equipment}</span>
                </div>
                <div className="flex justify-between">
                  <span>📚 Training:</span>
                  <span>{gameState.upgrades.training}</span>
                </div>
                <div className="flex justify-between">
                  <span>👮 Partners:</span>
                  <span>{gameState.upgrades.partner}</span>
                </div>
                <div className="flex justify-between">
                  <span>🚗 Patrol Units:</span>
                  <span>{gameState.upgrades.patrol}</span>
                </div>
                <div className="flex justify-between">
                  <span>🔍 Investigations:</span>
                  <span>{gameState.upgrades.investigation}</span>
                </div>
                <div className="flex justify-between">
                  <span>🏢 Precincts:</span>
                  <span>{gameState.upgrades.precinct}</span>
                </div>
                <div className="flex justify-between">
                  <span>🤖 AI Systems:</span>
                  <span>{gameState.upgrades.automation}</span>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <button
                  onClick={saveGame}
                  className="w-full p-2 bg-green-600 hover:bg-green-500 rounded text-sm font-semibold transition-colors"
                >
                  💾 Save Game
                </button>
                <button
                  onClick={resetGame}
                  className="w-full p-2 bg-red-600 hover:bg-red-500 rounded text-sm font-semibold transition-colors"
                >
                  🔄 Reset Progress
                </button>
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
