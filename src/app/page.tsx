"use client";

import { useState, useEffect } from "react";
import Decimal from "break_eternity.js";

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'progress' | 'upgrades' | 'efficiency' | 'legacy' | 'time' | 'special';
  criteria: {
    type: 'total_rp' | 'rank' | 'upgrade_count' | 'click_power' | 'passive_income' | 'prestige_count' | 'play_time' | 'special';
    target: Decimal | string | number;
    upgradeType?: string;
  };
  reward: {
    type: 'rp' | 'legacy_points' | 'multiplier';
    amount: Decimal;
  };
  unlocked: boolean;
  claimed: boolean;
}

interface GameState {
  respectPoints: Decimal;
  clickValue: Decimal;
  rank: string;
  passiveIncome: Decimal;
  legacyPoints: Decimal;
  totalRP: Decimal; // Track lifetime RP for prestige calculation
  prestigeCount: Decimal;
  playTime: number; // in seconds
  upgrades: {
    equipment: Decimal;
    training: Decimal;
    partner: Decimal;
    patrol: Decimal;
    investigation: Decimal;
    precinct: Decimal;
    automation: Decimal;
  };
  legacyUpgrades: {
    efficiency: Decimal; // +10% income per level
    wisdom: Decimal;     // -2% costs per level 
    equipment: Decimal;  // Unlock upgrades earlier
  };
  achievements: Achievement[];
}

const RANKS = [
  { name: "Beat Cop", requirement: new Decimal(0) },
  { name: "Detective", requirement: new Decimal(100) },
  { name: "Sergeant", requirement: new Decimal(500) }, 
  { name: "Lieutenant", requirement: new Decimal(2000) },
  { name: "Captain", requirement: new Decimal(10000) },
  { name: "Chief", requirement: new Decimal(50000) }
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  // Progress Milestones
  {
    id: 'first_click',
    title: 'First Day on the Beat',
    description: 'Earn your first Respect Point',
    category: 'progress',
    criteria: { type: 'total_rp', target: new Decimal(1) },
    reward: { type: 'rp', amount: new Decimal(10) },
    unlocked: false,
    claimed: false
  },
  {
    id: 'hundred_rp',
    title: 'Making Progress',
    description: 'Earn 100 Respect Points',
    category: 'progress',
    criteria: { type: 'total_rp', target: new Decimal(100) },
    reward: { type: 'rp', amount: new Decimal(50) },
    unlocked: false,
    claimed: false
  },
  {
    id: 'detective_rank',
    title: 'Detective Shield',
    description: 'Reach Detective rank',
    category: 'progress',
    criteria: { type: 'rank', target: 'Detective' },
    reward: { type: 'rp', amount: new Decimal(100) },
    unlocked: false,
    claimed: false
  },
  {
    id: 'chief_rank',
    title: 'Top of the Force',
    description: 'Reach Chief rank',
    category: 'progress',
    criteria: { type: 'rank', target: 'Chief' },
    reward: { type: 'legacy_points', amount: new Decimal(1) },
    unlocked: false,
    claimed: false
  },
  
  // Upgrade Mastery
  {
    id: 'first_upgrade',
    title: 'Self Improvement',
    description: 'Purchase your first upgrade',
    category: 'upgrades',
    criteria: { type: 'upgrade_count', target: new Decimal(1) },
    reward: { type: 'rp', amount: new Decimal(25) },
    unlocked: false,
    claimed: false
  },
  {
    id: 'ten_partners',
    title: 'Squad Leader',
    description: 'Have 10 Partners',
    category: 'upgrades',
    criteria: { type: 'upgrade_count', target: new Decimal(10), upgradeType: 'partner' },
    reward: { type: 'rp', amount: new Decimal(200) },
    unlocked: false,
    claimed: false
  },
  {
    id: 'automation_master',
    title: 'Tech Savvy',
    description: 'Purchase 5 AI Systems',
    category: 'upgrades',
    criteria: { type: 'upgrade_count', target: new Decimal(5), upgradeType: 'automation' },
    reward: { type: 'legacy_points', amount: new Decimal(1) },
    unlocked: false,
    claimed: false
  },
  
  // Efficiency Goals
  {
    id: 'strong_clicks',
    title: 'Power Patrol',
    description: 'Reach 100 click power',
    category: 'efficiency',
    criteria: { type: 'click_power', target: new Decimal(100) },
    reward: { type: 'rp', amount: new Decimal(500) },
    unlocked: false,
    claimed: false
  },
  {
    id: 'passive_income',
    title: 'Efficient Officer',
    description: 'Reach 50 passive income per second',
    category: 'efficiency',
    criteria: { type: 'passive_income', target: new Decimal(50) },
    reward: { type: 'rp', amount: new Decimal(1000) },
    unlocked: false,
    claimed: false
  },
  
  // Legacy Achievements
  {
    id: 'first_prestige',
    title: 'Retirement Ceremony',
    description: 'Complete your first prestige',
    category: 'legacy',
    criteria: { type: 'prestige_count', target: new Decimal(1) },
    reward: { type: 'legacy_points', amount: new Decimal(2) },
    unlocked: false,
    claimed: false
  },
  
  // Special Challenges
  {
    id: 'millionaire',
    title: 'Respected Veteran',
    description: 'Earn 1 Million total Respect Points',
    category: 'special',
    criteria: { type: 'total_rp', target: new Decimal(1000000) },
    reward: { type: 'legacy_points', amount: new Decimal(5) },
    unlocked: false,
    claimed: false
  }
];

export default function Home() {
  const [gameState, setGameState] = useState<GameState>({
    respectPoints: new Decimal(0),
    clickValue: new Decimal(1),
    rank: RANKS[0].name,
    passiveIncome: new Decimal(0),
    legacyPoints: new Decimal(0),
    totalRP: new Decimal(0),
    prestigeCount: new Decimal(0),
    playTime: 0,
    upgrades: {
      equipment: new Decimal(0),
      training: new Decimal(0),
      partner: new Decimal(0),
      patrol: new Decimal(0),
      investigation: new Decimal(0),
      precinct: new Decimal(0),
      automation: new Decimal(0)
    },
    legacyUpgrades: {
      efficiency: new Decimal(0),
      wisdom: new Decimal(0),
      equipment: new Decimal(0)
    },
    achievements: [...INITIAL_ACHIEVEMENTS]
  });

  const [clickAnimations, setClickAnimations] = useState<Array<{id: number, x: number, y: number}>>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [purchaseQuantity, setPurchaseQuantity] = useState<number | 'max'>(1);
  const [achievementNotifications, setAchievementNotifications] = useState<Achievement[]>([]);

  useEffect(() => {
    const savedGame = localStorage.getItem('cop-clicker-save');
    
    if (savedGame) {
      try {
        const loadedState = JSON.parse(savedGame);
        
        // Convert loaded numbers to Decimals
        const convertToDecimal = (value: any) => new Decimal(value || 0);
        
        // Ensure all required properties exist and convert to Decimal
        if (!loadedState.upgrades) {
          loadedState.upgrades = { 
            equipment: new Decimal(0), 
            training: new Decimal(0), 
            partner: new Decimal(0), 
            patrol: new Decimal(0), 
            investigation: new Decimal(0), 
            precinct: new Decimal(0), 
            automation: new Decimal(0) 
          };
        } else {
          // Convert and add missing upgrade properties for backward compatibility
          loadedState.upgrades.equipment = convertToDecimal(loadedState.upgrades.equipment);
          loadedState.upgrades.training = convertToDecimal(loadedState.upgrades.training);
          loadedState.upgrades.partner = convertToDecimal(loadedState.upgrades.partner);
          loadedState.upgrades.patrol = convertToDecimal(loadedState.upgrades.patrol);
          loadedState.upgrades.investigation = convertToDecimal(loadedState.upgrades.investigation);
          loadedState.upgrades.precinct = convertToDecimal(loadedState.upgrades.precinct);
          loadedState.upgrades.automation = convertToDecimal(loadedState.upgrades.automation);
        }
        
        // Handle legacy upgrades for backward compatibility
        if (!loadedState.legacyUpgrades) {
          loadedState.legacyUpgrades = {
            efficiency: new Decimal(0),
            wisdom: new Decimal(0),
            equipment: new Decimal(0)
          };
        } else {
          loadedState.legacyUpgrades.efficiency = convertToDecimal(loadedState.legacyUpgrades.efficiency);
          loadedState.legacyUpgrades.wisdom = convertToDecimal(loadedState.legacyUpgrades.wisdom);
          loadedState.legacyUpgrades.equipment = convertToDecimal(loadedState.legacyUpgrades.equipment);
        }
        
        // Convert main state values to Decimal
        loadedState.respectPoints = convertToDecimal(loadedState.respectPoints);
        loadedState.legacyPoints = convertToDecimal(loadedState.legacyPoints);
        loadedState.totalRP = convertToDecimal(loadedState.totalRP);
        loadedState.prestigeCount = convertToDecimal(loadedState.prestigeCount);
        loadedState.playTime = loadedState.playTime || 0;
        
        // Handle achievements for backward compatibility
        if (!loadedState.achievements) {
          loadedState.achievements = [...INITIAL_ACHIEVEMENTS];
        } else {
          // Merge with new achievements while preserving progress
          const loadedAchievementIds = loadedState.achievements.map((a: Achievement) => a.id);
          const newAchievements = INITIAL_ACHIEVEMENTS.filter(a => !loadedAchievementIds.includes(a.id));
          loadedState.achievements = [...loadedState.achievements, ...newAchievements];
        }
        
        if (!loadedState.rank) {
          loadedState.rank = RANKS[0].name;
        }
        
        // Recalculate values to ensure consistency
        const rankIndex = RANKS.findIndex(rank => rank.name === loadedState.rank);
        const rankMultiplier = new Decimal(rankIndex >= 0 ? 1 + (rankIndex * 0.25) : 1);
        
        // Calculate click value with legacy bonuses
        const baseClickValue = new Decimal(1);
        const equipmentBonus = loadedState.upgrades.equipment.mul(1);
        const trainingBonus = loadedState.upgrades.training.mul(2);
        const legacyMultiplier = new Decimal(1).add((loadedState.legacyUpgrades?.efficiency || new Decimal(0)).mul(0.1));
        loadedState.clickValue = baseClickValue.add(equipmentBonus).add(trainingBonus).mul(rankMultiplier).mul(legacyMultiplier).floor();
        
        // Calculate passive income with legacy bonuses
        const partnerIncome = loadedState.upgrades.partner.mul(1);
        const patrolIncome = loadedState.upgrades.patrol.mul(3);
        const investigationIncome = loadedState.upgrades.investigation.mul(12);
        const precinctIncome = loadedState.upgrades.precinct.mul(50);
        const automationBonus = loadedState.upgrades.automation.gt(0) 
          ? new Decimal(1).add(loadedState.upgrades.automation.mul(0.5)) 
          : new Decimal(1);
        
        const totalPassiveIncome = partnerIncome.add(patrolIncome).add(investigationIncome).add(precinctIncome).mul(automationBonus);
        loadedState.passiveIncome = totalPassiveIncome.mul(rankMultiplier).mul(legacyMultiplier).floor();
        
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
          // Convert Decimals to numbers for JSON storage
          const saveState = {
            ...gameState,
            respectPoints: gameState.respectPoints.toString(),
            clickValue: gameState.clickValue.toString(),
            passiveIncome: gameState.passiveIncome.toString(),
            legacyPoints: gameState.legacyPoints.toString(),
            totalRP: gameState.totalRP.toString(),
            prestigeCount: gameState.prestigeCount.toString(),
            upgrades: {
              equipment: gameState.upgrades.equipment.toString(),
              training: gameState.upgrades.training.toString(),
              partner: gameState.upgrades.partner.toString(),
              patrol: gameState.upgrades.patrol.toString(),
              investigation: gameState.upgrades.investigation.toString(),
              precinct: gameState.upgrades.precinct.toString(),
              automation: gameState.upgrades.automation.toString(),
            },
            legacyUpgrades: {
              efficiency: gameState.legacyUpgrades.efficiency.toString(),
              wisdom: gameState.legacyUpgrades.wisdom.toString(),
              equipment: gameState.legacyUpgrades.equipment.toString(),
            }
          };
          localStorage.setItem('cop-clicker-save', JSON.stringify(saveState));
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
        const saveState = {
          ...gameState,
          respectPoints: gameState.respectPoints.toString(),
          clickValue: gameState.clickValue.toString(),
          passiveIncome: gameState.passiveIncome.toString(),
          legacyPoints: gameState.legacyPoints.toString(),
          totalRP: gameState.totalRP.toString(),
          prestigeCount: gameState.prestigeCount.toString(),
          upgrades: {
            equipment: gameState.upgrades.equipment.toString(),
            training: gameState.upgrades.training.toString(),
            partner: gameState.upgrades.partner.toString(),
            patrol: gameState.upgrades.patrol.toString(),
            investigation: gameState.upgrades.investigation.toString(),
            precinct: gameState.upgrades.precinct.toString(),
            automation: gameState.upgrades.automation.toString(),
          },
          legacyUpgrades: {
            efficiency: gameState.legacyUpgrades.efficiency.toString(),
            wisdom: gameState.legacyUpgrades.wisdom.toString(),
            equipment: gameState.legacyUpgrades.equipment.toString(),
          }
        };
        localStorage.setItem('cop-clicker-save', JSON.stringify(saveState));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [gameState, isLoaded]);

  useEffect(() => {
    if (isLoaded && gameState.passiveIncome.gt(0)) {
      const passiveTimer = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          respectPoints: prev.respectPoints.add(prev.passiveIncome),
          totalRP: prev.totalRP.add(prev.passiveIncome)
        }));
      }, 1000);

      return () => clearInterval(passiveTimer);
    }
  }, [gameState.passiveIncome, isLoaded]);

  // Track play time
  useEffect(() => {
    if (isLoaded) {
      const playTimer = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          playTime: prev.playTime + 1
        }));
      }, 1000);

      return () => clearInterval(playTimer);
    }
  }, [isLoaded]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setGameState(prev => ({
      ...prev,
      respectPoints: prev.respectPoints.add(prev.clickValue),
      totalRP: prev.totalRP.add(prev.clickValue)
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

  const formatNumber = (num: Decimal) => {
    if (num.gte(1e308)) return num.toExponential(2);
    if (num.gte(1e33)) return num.toExponential(2);
    if (num.gte(1e30)) return num.div(1e30).toFixed(1) + ' No';
    if (num.gte(1e27)) return num.div(1e27).toFixed(1) + ' Oc';
    if (num.gte(1e24)) return num.div(1e24).toFixed(1) + ' Sp';
    if (num.gte(1e21)) return num.div(1e21).toFixed(1) + ' Sx';
    if (num.gte(1e18)) return num.div(1e18).toFixed(1) + ' Qi';
    if (num.gte(1e15)) return num.div(1e15).toFixed(1) + ' Qa';
    if (num.gte(1e12)) return num.div(1e12).toFixed(1) + ' T';
    if (num.gte(1e9)) return num.div(1e9).toFixed(1) + ' B';
    if (num.gte(1e6)) return num.div(1e6).toFixed(1) + ' M';
    if (num.gte(1e3)) return num.div(1e3).toFixed(1) + ' K';
    return num.floor().toString();
  };

  const getUpgradeCost = (upgradeType: string, currentLevel: Decimal): Decimal => {
    const baseCosts = {
      equipment: new Decimal(10),
      training: new Decimal(25),
      partner: new Decimal(15),      // Much cheaper for first passive income
      patrol: new Decimal(50),
      investigation: new Decimal(200),
      precinct: new Decimal(1000),
      automation: new Decimal(5000)
    };
    
    const scalingFactors = {
      equipment: new Decimal(1.4),   // Gentler scaling
      training: new Decimal(1.6),
      partner: new Decimal(1.3),     // Very gentle scaling for early passive
      patrol: new Decimal(1.5),
      investigation: new Decimal(1.7),
      precinct: new Decimal(2.0),
      automation: new Decimal(2.5)
    };
    
    const baseCost = baseCosts[upgradeType as keyof typeof baseCosts] || new Decimal(10);
    const scaling = scalingFactors[upgradeType as keyof typeof scalingFactors] || new Decimal(1.5);
    const costReduction = getLegacyCostReduction();
    
    return baseCost.mul(Decimal.pow(scaling, currentLevel)).mul(costReduction).floor();
  };

  const getBulkUpgradeCost = (upgradeType: string, currentLevel: Decimal, quantity: Decimal): Decimal => {
    const baseCosts = {
      equipment: new Decimal(10),
      training: new Decimal(25),
      partner: new Decimal(15),
      patrol: new Decimal(50),
      investigation: new Decimal(200),
      precinct: new Decimal(1000),
      automation: new Decimal(5000)
    };
    
    const scalingFactors = {
      equipment: new Decimal(1.4),
      training: new Decimal(1.6),
      partner: new Decimal(1.3),
      patrol: new Decimal(1.5),
      investigation: new Decimal(1.7),
      precinct: new Decimal(2.0),
      automation: new Decimal(2.5)
    };
    
    const baseCost = baseCosts[upgradeType as keyof typeof baseCosts] || new Decimal(10);
    const scaling = scalingFactors[upgradeType as keyof typeof scalingFactors] || new Decimal(1.5);
    const costReduction = getLegacyCostReduction();
    
    // Calculate geometric series sum: baseCost * scaling^currentLevel * (scaling^quantity - 1) / (scaling - 1)
    if (scaling.eq(1)) {
      return baseCost.mul(currentLevel).mul(quantity).mul(costReduction);
    }
    
    const startCost = baseCost.mul(Decimal.pow(scaling, currentLevel));
    const scalingPowerQuantity = Decimal.pow(scaling, quantity);
    const geometricSum = startCost.mul(scalingPowerQuantity.sub(1)).div(scaling.sub(1));
    
    return geometricSum.mul(costReduction).floor();
  };

  const getMaxAffordableQuantity = (upgradeType: string, currentLevel: Decimal, availableMoney: Decimal): Decimal => {
    const baseCosts = {
      equipment: new Decimal(10),
      training: new Decimal(25),
      partner: new Decimal(15),
      patrol: new Decimal(50),
      investigation: new Decimal(200),
      precinct: new Decimal(1000),
      automation: new Decimal(5000)
    };
    
    const scalingFactors = {
      equipment: new Decimal(1.4),
      training: new Decimal(1.6),
      partner: new Decimal(1.3),
      patrol: new Decimal(1.5),
      investigation: new Decimal(1.7),
      precinct: new Decimal(2.0),
      automation: new Decimal(2.5)
    };
    
    const baseCost = baseCosts[upgradeType as keyof typeof baseCosts] || new Decimal(10);
    const scaling = scalingFactors[upgradeType as keyof typeof scalingFactors] || new Decimal(1.5);
    
    if (scaling.eq(1)) {
      return availableMoney.div(baseCost.mul(currentLevel)).floor();
    }
    
    const startCost = baseCost.mul(Decimal.pow(scaling, currentLevel));
    if (availableMoney.lt(startCost)) {
      return new Decimal(0);
    }
    
    // Binary search to find maximum affordable quantity
    let low = new Decimal(1);
    let high = new Decimal(1000); // Start with reasonable upper bound
    
    // Increase upper bound if needed
    while (getBulkUpgradeCost(upgradeType, currentLevel, high).lte(availableMoney)) {
      high = high.mul(10);
    }
    
    let result = new Decimal(0);
    
    // Binary search
    while (low.lte(high)) {
      const mid = low.add(high).div(2).floor();
      const cost = getBulkUpgradeCost(upgradeType, currentLevel, mid);
      
      if (cost.lte(availableMoney)) {
        result = mid;
        low = mid.add(1);
      } else {
        high = mid.sub(1);
      }
    }
    
    return result;
  };

  const getRankMultiplier = (): Decimal => {
    if (!gameState?.rank) return new Decimal(1);
    const rankIndex = RANKS.findIndex(rank => rank.name === gameState.rank);
    return rankIndex >= 0 ? new Decimal(1 + (rankIndex * 0.25)) : new Decimal(1); // 25% bonus per rank
  };

  const getLegacyMultiplier = (): Decimal => {
    if (!gameState?.legacyUpgrades) return new Decimal(1);
    // +10% per efficiency level
    return new Decimal(1).add(gameState.legacyUpgrades.efficiency.mul(0.1));
  };

  const getLegacyCostReduction = (): Decimal => {
    if (!gameState?.legacyUpgrades) return new Decimal(1);
    // -2% cost per wisdom level, minimum 10% cost
    const reduction = gameState.legacyUpgrades.wisdom.mul(0.02);
    return Decimal.max(new Decimal(0.1), new Decimal(1).sub(reduction));
  };

  const getRankRequirementReduction = (): Decimal => {
    if (!gameState?.legacyUpgrades) return new Decimal(1);
    // -10% rank requirements per equipment level, minimum 10% requirements
    const reductionPerLevel = new Decimal(0.1);
    const totalReduction = gameState.legacyUpgrades.equipment.mul(reductionPerLevel);
    const multiplier = Decimal.pow(new Decimal(0.9), gameState.legacyUpgrades.equipment);
    return Decimal.max(new Decimal(0.1), multiplier);
  };

  const calculatePrestigeGain = (): Decimal => {
    if (!gameState?.totalRP) return new Decimal(0);
    const prestigeThreshold = new Decimal(50000); // 50K RP
    if (gameState.totalRP.lt(prestigeThreshold)) return new Decimal(0);
    
    // Formula: sqrt(totalRP / 50000)
    return gameState.totalRP.div(prestigeThreshold).sqrt().floor();
  };

  const canPrestige = (): boolean => {
    return calculatePrestigeGain().gt(0) && gameState.rank === "Chief";
  };

  const performPrestige = () => {
    if (!canPrestige()) return;
    
    const legacyGain = calculatePrestigeGain();
    
    if (confirm(`Retire and gain ${legacyGain.toString()} Legacy Points? This will reset your progress but grant permanent bonuses.`)) {
      setGameState(prev => ({
        respectPoints: new Decimal(0),
        clickValue: new Decimal(1),
        rank: RANKS[0].name,
        passiveIncome: new Decimal(0),
        legacyPoints: prev.legacyPoints.add(legacyGain),
        totalRP: new Decimal(0), // Reset for next prestige
        prestigeCount: prev.prestigeCount.add(1),
        playTime: prev.playTime, // Keep play time
        upgrades: {
          equipment: new Decimal(0),
          training: new Decimal(0),
          partner: new Decimal(0),
          patrol: new Decimal(0),
          investigation: new Decimal(0),
          precinct: new Decimal(0),
          automation: new Decimal(0)
        },
        legacyUpgrades: prev.legacyUpgrades, // Keep legacy upgrades
        achievements: prev.achievements // Keep achievements
      }));
    }
  };

  const getLegacyUpgradeCost = (upgradeType: 'efficiency' | 'wisdom' | 'equipment'): Decimal => {
    const currentLevel = gameState.legacyUpgrades[upgradeType];
    const baseCost = new Decimal(1);
    const scaling = new Decimal(2); // 2x scaling for legacy upgrades
    return baseCost.mul(Decimal.pow(scaling, currentLevel));
  };

  const canAffordLegacyUpgrade = (upgradeType: 'efficiency' | 'wisdom' | 'equipment'): boolean => {
    return gameState.legacyPoints.gte(getLegacyUpgradeCost(upgradeType));
  };

  const buyLegacyUpgrade = (upgradeType: 'efficiency' | 'wisdom' | 'equipment') => {
    const cost = getLegacyUpgradeCost(upgradeType);
    
    if (gameState.legacyPoints.gte(cost)) {
      setGameState(prev => ({
        ...prev,
        legacyPoints: prev.legacyPoints.sub(cost),
        legacyUpgrades: {
          ...prev.legacyUpgrades,
          [upgradeType]: prev.legacyUpgrades[upgradeType].add(1)
        }
      }));
    }
  };

  const checkAchievements = () => {
    const newlyUnlocked: Achievement[] = [];
    
    setGameState(prev => {
      const updatedAchievements = prev.achievements.map(achievement => {
        if (achievement.unlocked || achievement.claimed) return achievement;
        
        let shouldUnlock = false;
        
        switch (achievement.criteria.type) {
          case 'total_rp':
            shouldUnlock = prev.totalRP.gte(achievement.criteria.target as Decimal);
            break;
          case 'rank':
            shouldUnlock = prev.rank === achievement.criteria.target;
            break;
          case 'upgrade_count':
            if (achievement.criteria.upgradeType) {
              const upgradeLevel = prev.upgrades[achievement.criteria.upgradeType as keyof typeof prev.upgrades];
              shouldUnlock = upgradeLevel.gte(achievement.criteria.target as Decimal);
            } else {
              // Total upgrades count
              const totalUpgrades = Object.values(prev.upgrades).reduce((sum, level) => sum.add(level), new Decimal(0));
              shouldUnlock = totalUpgrades.gte(achievement.criteria.target as Decimal);
            }
            break;
          case 'click_power':
            shouldUnlock = prev.clickValue.gte(achievement.criteria.target as Decimal);
            break;
          case 'passive_income':
            shouldUnlock = prev.passiveIncome.gte(achievement.criteria.target as Decimal);
            break;
          case 'prestige_count':
            shouldUnlock = prev.prestigeCount.gte(achievement.criteria.target as Decimal);
            break;
          case 'play_time':
            shouldUnlock = prev.playTime >= (achievement.criteria.target as number);
            break;
        }
        
        if (shouldUnlock && !achievement.unlocked) {
          newlyUnlocked.push(achievement);
          return { ...achievement, unlocked: true };
        }
        
        return achievement;
      });
      
      return { ...prev, achievements: updatedAchievements };
    });
    
    // Show notifications for newly unlocked achievements
    if (newlyUnlocked.length > 0) {
      setAchievementNotifications(prev => [...prev, ...newlyUnlocked]);
    }
  };

  const claimAchievement = (achievementId: string) => {
    const achievement = gameState.achievements.find(a => a.id === achievementId);
    if (!achievement || !achievement.unlocked || achievement.claimed) return;
    
    setGameState(prev => {
      const updatedAchievements = prev.achievements.map(a => 
        a.id === achievementId ? { ...a, claimed: true } : a
      );
      
      let updatedState = { ...prev, achievements: updatedAchievements };
      
      // Apply rewards
      switch (achievement.reward.type) {
        case 'rp':
          updatedState.respectPoints = updatedState.respectPoints.add(achievement.reward.amount);
          updatedState.totalRP = updatedState.totalRP.add(achievement.reward.amount);
          break;
        case 'legacy_points':
          updatedState.legacyPoints = updatedState.legacyPoints.add(achievement.reward.amount);
          break;
      }
      
      return updatedState;
    });
  };

  const dismissNotification = (achievementId: string) => {
    setAchievementNotifications(prev => prev.filter(a => a.id !== achievementId));
  };

  // Check achievements whenever game state changes
  useEffect(() => {
    if (isLoaded) {
      checkAchievements();
    }
  }, [gameState.totalRP, gameState.rank, gameState.clickValue, gameState.passiveIncome, gameState.prestigeCount, gameState.upgrades, isLoaded]);

  const saveGame = () => {
    try {
      const saveState = {
        ...gameState,
        respectPoints: gameState.respectPoints.toString(),
        clickValue: gameState.clickValue.toString(),
        passiveIncome: gameState.passiveIncome.toString(),
        legacyPoints: gameState.legacyPoints.toString(),
        totalRP: gameState.totalRP.toString(),
        prestigeCount: gameState.prestigeCount.toString(),
        upgrades: {
          equipment: gameState.upgrades.equipment.toString(),
          training: gameState.upgrades.training.toString(),
          partner: gameState.upgrades.partner.toString(),
          patrol: gameState.upgrades.patrol.toString(),
          investigation: gameState.upgrades.investigation.toString(),
          precinct: gameState.upgrades.precinct.toString(),
          automation: gameState.upgrades.automation.toString(),
        },
        legacyUpgrades: {
          efficiency: gameState.legacyUpgrades.efficiency.toString(),
          wisdom: gameState.legacyUpgrades.wisdom.toString(),
          equipment: gameState.legacyUpgrades.equipment.toString(),
        }
      };
      localStorage.setItem('cop-clicker-save', JSON.stringify(saveState));
    } catch (e) {
      console.error('Failed to save game:', e);
    }
  };

  const resetGame = () => {
    if (confirm('Are you sure you want to reset your progress? This cannot be undone!')) {
      localStorage.removeItem('cop-clicker-save');
      setGameState({
        respectPoints: new Decimal(0),
        clickValue: new Decimal(1),
        rank: RANKS[0].name,
        passiveIncome: new Decimal(0),
        legacyPoints: new Decimal(0),
        totalRP: new Decimal(0),
        prestigeCount: new Decimal(0),
        playTime: 0,
        upgrades: {
          equipment: new Decimal(0),
          training: new Decimal(0),
          partner: new Decimal(0),
          patrol: new Decimal(0),
          investigation: new Decimal(0),
          precinct: new Decimal(0),
          automation: new Decimal(0)
        },
        legacyUpgrades: {
          efficiency: new Decimal(0),
          wisdom: new Decimal(0),
          equipment: new Decimal(0)
        },
        achievements: [...INITIAL_ACHIEVEMENTS]
      });
    }
  };

  const buyUpgrade = (upgradeType: 'equipment' | 'training' | 'partner' | 'patrol' | 'investigation' | 'precinct' | 'automation') => {
    let quantity: Decimal;
    
    if (purchaseQuantity === 'max') {
      quantity = getMaxAffordableQuantity(upgradeType, gameState.upgrades[upgradeType], gameState.respectPoints);
    } else {
      quantity = new Decimal(purchaseQuantity);
    }
    
    if (quantity.lte(0)) return;
    
    const cost = getBulkUpgradeCost(upgradeType, gameState.upgrades[upgradeType], quantity);
    
    if (gameState.respectPoints.gte(cost)) {
      setGameState(prev => {
        const newState = {
          ...prev,
          respectPoints: prev.respectPoints.sub(cost),
          upgrades: {
            ...prev.upgrades,
            [upgradeType]: prev.upgrades[upgradeType].add(quantity)
          }
        };

        const rankMultiplier = getRankMultiplier();
        const legacyMultiplier = getLegacyMultiplier();

        // Calculate click value with legacy bonuses
        const baseClickValue = new Decimal(1);
        const equipmentBonus = newState.upgrades.equipment.mul(1);
        const trainingBonus = newState.upgrades.training.mul(2);
        newState.clickValue = baseClickValue.add(equipmentBonus).add(trainingBonus).mul(rankMultiplier).mul(legacyMultiplier).floor();
        
        // Calculate passive income with legacy bonuses
        const partnerIncome = newState.upgrades.partner.mul(1);
        const patrolIncome = newState.upgrades.patrol.mul(3);
        const investigationIncome = newState.upgrades.investigation.mul(12);
        const precinctIncome = newState.upgrades.precinct.mul(50);
        const automationBonus = newState.upgrades.automation.gt(0) 
          ? new Decimal(1).add(newState.upgrades.automation.mul(0.5)) 
          : new Decimal(1);
        
        const totalPassiveIncome = partnerIncome.add(patrolIncome).add(investigationIncome).add(precinctIncome).mul(automationBonus);
        newState.passiveIncome = totalPassiveIncome.mul(rankMultiplier).mul(legacyMultiplier).floor();

        return newState;
      });
      
      // Save immediately after important actions
      setTimeout(() => saveGame(), 100);
    }
  };

  const canAfford = (upgradeType: 'equipment' | 'training' | 'partner' | 'patrol' | 'investigation' | 'precinct' | 'automation') => {
    if (!gameState?.upgrades) return false;
    
    let quantity: Decimal;
    if (purchaseQuantity === 'max') {
      quantity = getMaxAffordableQuantity(upgradeType, gameState.upgrades[upgradeType], gameState.respectPoints);
      return quantity.gt(0);
    } else {
      quantity = new Decimal(purchaseQuantity);
    }
    
    const cost = getBulkUpgradeCost(upgradeType, gameState.upgrades[upgradeType], quantity);
    return gameState.respectPoints.gte(cost);
  };

  const updateRank = () => {
    if (!gameState?.rank) return;
    const currentRankIndex = RANKS.findIndex(rank => rank.name === gameState.rank);
    const nextRankIndex = currentRankIndex + 1;
    
    // Apply legacy equipment reduction to rank requirements
    const rankReduction = getRankRequirementReduction();
    const adjustedRequirement = nextRankIndex < RANKS.length 
      ? RANKS[nextRankIndex].requirement.mul(rankReduction)
      : new Decimal(Infinity);
    
    if (nextRankIndex < RANKS.length && gameState.respectPoints.gte(adjustedRequirement)) {
      setGameState(prev => {
        const newState = { ...prev, rank: RANKS[nextRankIndex].name };
        const rankMultiplier = new Decimal(1 + (nextRankIndex * 0.25));
        
        // Recalculate values with new rank bonus and legacy bonuses
        const legacyMultiplier = new Decimal(1).add((newState.legacyUpgrades?.efficiency || new Decimal(0)).mul(0.1));
        const baseClickValue = new Decimal(1);
        const equipmentBonus = newState.upgrades.equipment.mul(1);
        const trainingBonus = newState.upgrades.training.mul(2);
        newState.clickValue = baseClickValue.add(equipmentBonus).add(trainingBonus).mul(rankMultiplier).mul(legacyMultiplier).floor();
        
        // Calculate passive income with legacy bonuses
        const partnerIncome = newState.upgrades.partner.mul(1);
        const patrolIncome = newState.upgrades.patrol.mul(3);
        const investigationIncome = newState.upgrades.investigation.mul(12);
        const precinctIncome = newState.upgrades.precinct.mul(50);
        const automationBonus = newState.upgrades.automation.gt(0) 
          ? new Decimal(1).add(newState.upgrades.automation.mul(0.5)) 
          : new Decimal(1);
        
        const totalPassiveIncome = partnerIncome.add(patrolIncome).add(investigationIncome).add(precinctIncome).mul(automationBonus);
        newState.passiveIncome = totalPassiveIncome.mul(rankMultiplier).mul(legacyMultiplier).floor();
        
        return newState;
      });
    }
  };

  const getCurrentRankInfo = () => {
    if (!gameState?.rank) return { current: RANKS[0], next: RANKS[1], progress: 0, adjustedRequirement: new Decimal(0) };
    const currentIndex = RANKS.findIndex(rank => rank.name === gameState.rank);
    const nextIndex = currentIndex + 1;
    
    const rankReduction = getRankRequirementReduction();
    const adjustedRequirement = nextIndex < RANKS.length 
      ? RANKS[nextIndex].requirement.mul(rankReduction)
      : new Decimal(0);
    
    return {
      current: RANKS[currentIndex] || RANKS[0],
      next: nextIndex < RANKS.length ? RANKS[nextIndex] : null,
      adjustedRequirement,
      progress: nextIndex < RANKS.length 
        ? Math.min(100, gameState.respectPoints.div(adjustedRequirement).mul(100).toNumber())
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

        {/* Achievement Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {achievementNotifications.map((achievement) => (
            <div
              key={achievement.id}
              className="bg-yellow-600 border border-yellow-400 rounded-lg p-4 shadow-lg animate-pulse max-w-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm">🏆 Achievement Unlocked!</div>
                  <div className="text-sm font-semibold">{achievement.title}</div>
                  <div className="text-xs text-yellow-100">{achievement.description}</div>
                  <div className="text-xs text-yellow-200 mt-1">
                    Reward: {achievement.reward.type === 'rp' ? `${formatNumber(achievement.reward.amount)} RP` : 
                             achievement.reward.type === 'legacy_points' ? `${formatNumber(achievement.reward.amount)} LP` : 
                             'Multiplier Bonus'}
                  </div>
                </div>
                <button
                  onClick={() => {
                    claimAchievement(achievement.id);
                    dismissNotification(achievement.id);
                  }}
                  className="ml-2 bg-yellow-500 hover:bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-bold"
                >
                  Claim
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-blue-800/50 rounded-lg p-6 mb-6 backdrop-blur-sm border border-blue-600/30">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold mb-2">Current Rank: {gameState.rank}</h2>
                <div className="text-3xl font-mono">
                  {formatNumber(gameState.respectPoints)} Respect Points
                </div>
                <div className="text-lg text-blue-200 mt-2">
                  +{formatNumber(gameState.clickValue)} per click
                  {gameState.passiveIncome.gt(0) && (
                    <div className="text-sm text-green-300">
                      +{formatNumber(gameState.passiveIncome)} per second
                    </div>
                  )}
                  {rankMultiplier.gt(1) && (
                    <div className="text-sm text-yellow-300">
                      Rank Bonus: +{rankMultiplier.sub(1).mul(100).toFixed(0)}%
                    </div>
                  )}
                  {gameState.legacyPoints.gt(0) && (
                    <div className="text-sm text-purple-300">
                      Legacy Bonus: +{getLegacyMultiplier().sub(1).mul(100).toFixed(0)}%
                    </div>
                  )}
                </div>
                
                {(() => {
                  const rankInfo = getCurrentRankInfo();
                  return rankInfo.next ? (
                    <div className="mt-4">
                      <div className="text-sm text-blue-200 mb-2">
                        Next: {rankInfo.next.name} ({formatNumber(rankInfo.adjustedRequirement)} RP)
                        {getRankRequirementReduction().lt(1) && (
                          <span className="text-purple-300 text-xs ml-1">
                            (was {formatNumber(rankInfo.next.requirement)})
                          </span>
                        )}
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
                    +{gameState.clickValue.toString()}
                  </div>
                ))}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-800/50 rounded-lg p-6 backdrop-blur-sm border border-blue-600/30">
              <h3 className="text-xl font-bold mb-4">👤 Click Upgrades</h3>
              
              <div className="mb-4">
                <div className="text-sm text-blue-200 mb-2">Purchase Quantity:</div>
                <div className="flex flex-wrap gap-1">
                  {([1, 10, 100, 1000, 'max'] as const).map((qty) => (
                    <button
                      key={qty}
                      onClick={() => setPurchaseQuantity(qty)}
                      className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                        purchaseQuantity === qty
                          ? 'bg-blue-500 text-white border border-blue-300'
                          : 'bg-blue-700/50 text-blue-200 border border-blue-600/50 hover:bg-blue-600/50'
                      }`}
                    >
                      {qty === 'max' ? 'Max' : `${qty}x`}
                    </button>
                  ))}
                </div>
              </div>
              
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
                  <div className="font-semibold text-sm">🔧 Equipment ({gameState.upgrades.equipment.toString()})</div>
                  <div className="text-xs text-blue-200">
                    {purchaseQuantity === 1 ? '+1 click value' : `+${purchaseQuantity === 'max' ? getMaxAffordableQuantity('equipment', gameState.upgrades.equipment, gameState.respectPoints).toString() : purchaseQuantity} click value`}
                  </div>
                  <div className="text-xs text-yellow-300">
                    Cost: {formatNumber(
                      purchaseQuantity === 1 
                        ? getUpgradeCost('equipment', gameState.upgrades.equipment)
                        : getBulkUpgradeCost('equipment', gameState.upgrades.equipment, 
                            purchaseQuantity === 'max' 
                              ? getMaxAffordableQuantity('equipment', gameState.upgrades.equipment, gameState.respectPoints)
                              : new Decimal(purchaseQuantity)
                          )
                    )} RP
                    {purchaseQuantity !== 1 && (
                      <span className="ml-1 text-blue-300">
                        ({purchaseQuantity === 'max' ? getMaxAffordableQuantity('equipment', gameState.upgrades.equipment, gameState.respectPoints).toString() : purchaseQuantity}x)
                      </span>
                    )}
                  </div>
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
                  <div className="font-semibold text-sm">📚 Training ({gameState.upgrades.training.toString()})</div>
                  <div className="text-xs text-blue-200">
                    {purchaseQuantity === 1 ? '+2 click value' : `+${(purchaseQuantity === 'max' ? getMaxAffordableQuantity('training', gameState.upgrades.training, gameState.respectPoints) : new Decimal(purchaseQuantity)).mul(2).toString()} click value`}
                  </div>
                  <div className="text-xs text-yellow-300">
                    Cost: {formatNumber(
                      purchaseQuantity === 1 
                        ? getUpgradeCost('training', gameState.upgrades.training)
                        : getBulkUpgradeCost('training', gameState.upgrades.training, 
                            purchaseQuantity === 'max' 
                              ? getMaxAffordableQuantity('training', gameState.upgrades.training, gameState.respectPoints)
                              : new Decimal(purchaseQuantity)
                          )
                    )} RP
                    {purchaseQuantity !== 1 && (
                      <span className="ml-1 text-blue-300">
                        ({purchaseQuantity === 'max' ? getMaxAffordableQuantity('training', gameState.upgrades.training, gameState.respectPoints).toString() : purchaseQuantity}x)
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-green-800/50 rounded-lg p-6 backdrop-blur-sm border border-green-600/30">
              <h3 className="text-xl font-bold mb-4">💰 Passive Rank</h3>
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
                  <div className="font-semibold text-sm">👮 Partner ({gameState.upgrades.partner.toString()})</div>
                  <div className="text-xs text-green-200">
                    {purchaseQuantity === 1 ? '+1 RP/sec' : `+${purchaseQuantity === 'max' ? getMaxAffordableQuantity('partner', gameState.upgrades.partner, gameState.respectPoints).toString() : purchaseQuantity} RP/sec`}
                  </div>
                  <div className="text-xs text-yellow-300">
                    Cost: {formatNumber(
                      purchaseQuantity === 1 
                        ? getUpgradeCost('partner', gameState.upgrades.partner)
                        : getBulkUpgradeCost('partner', gameState.upgrades.partner, 
                            purchaseQuantity === 'max' 
                              ? getMaxAffordableQuantity('partner', gameState.upgrades.partner, gameState.respectPoints)
                              : new Decimal(purchaseQuantity)
                          )
                    )} RP
                    {purchaseQuantity !== 1 && (
                      <span className="ml-1 text-green-300">
                        ({purchaseQuantity === 'max' ? getMaxAffordableQuantity('partner', gameState.upgrades.partner, gameState.respectPoints).toString() : purchaseQuantity}x)
                      </span>
                    )}
                  </div>
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
                  <div className="font-semibold text-sm">🚗 Patrol Unit ({gameState.upgrades.patrol.toString()})</div>
                  <div className="text-xs text-green-200">
                    {purchaseQuantity === 1 ? '+3 RP/sec' : `+${(purchaseQuantity === 'max' ? getMaxAffordableQuantity('patrol', gameState.upgrades.patrol, gameState.respectPoints) : new Decimal(purchaseQuantity)).mul(3).toString()} RP/sec`}
                  </div>
                  <div className="text-xs text-yellow-300">
                    Cost: {formatNumber(
                      purchaseQuantity === 1 
                        ? getUpgradeCost('patrol', gameState.upgrades.patrol)
                        : getBulkUpgradeCost('patrol', gameState.upgrades.patrol, 
                            purchaseQuantity === 'max' 
                              ? getMaxAffordableQuantity('patrol', gameState.upgrades.patrol, gameState.respectPoints)
                              : new Decimal(purchaseQuantity)
                          )
                    )} RP
                    {purchaseQuantity !== 1 && (
                      <span className="ml-1 text-green-300">
                        ({purchaseQuantity === 'max' ? getMaxAffordableQuantity('patrol', gameState.upgrades.patrol, gameState.respectPoints).toString() : purchaseQuantity}x)
                      </span>
                    )}
                  </div>
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
                  <div className="font-semibold text-sm">🔍 Investigation ({gameState.upgrades.investigation.toString()})</div>
                  <div className="text-xs text-green-200">
                    {purchaseQuantity === 1 ? '+12 RP/sec' : `+${(purchaseQuantity === 'max' ? getMaxAffordableQuantity('investigation', gameState.upgrades.investigation, gameState.respectPoints) : new Decimal(purchaseQuantity)).mul(12).toString()} RP/sec`}
                  </div>
                  <div className="text-xs text-yellow-300">
                    Cost: {formatNumber(
                      purchaseQuantity === 1 
                        ? getUpgradeCost('investigation', gameState.upgrades.investigation)
                        : getBulkUpgradeCost('investigation', gameState.upgrades.investigation, 
                            purchaseQuantity === 'max' 
                              ? getMaxAffordableQuantity('investigation', gameState.upgrades.investigation, gameState.respectPoints)
                              : new Decimal(purchaseQuantity)
                          )
                    )} RP
                    {purchaseQuantity !== 1 && (
                      <span className="ml-1 text-green-300">
                        ({purchaseQuantity === 'max' ? getMaxAffordableQuantity('investigation', gameState.upgrades.investigation, gameState.respectPoints).toString() : purchaseQuantity}x)
                      </span>
                    )}
                  </div>
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
                  <div className="font-semibold text-sm">🏢 Precinct ({gameState.upgrades.precinct.toString()})</div>
                  <div className="text-xs text-green-200">
                    {purchaseQuantity === 1 ? '+50 RP/sec' : `+${(purchaseQuantity === 'max' ? getMaxAffordableQuantity('precinct', gameState.upgrades.precinct, gameState.respectPoints) : new Decimal(purchaseQuantity)).mul(50).toString()} RP/sec`}
                  </div>
                  <div className="text-xs text-yellow-300">
                    Cost: {formatNumber(
                      purchaseQuantity === 1 
                        ? getUpgradeCost('precinct', gameState.upgrades.precinct)
                        : getBulkUpgradeCost('precinct', gameState.upgrades.precinct, 
                            purchaseQuantity === 'max' 
                              ? getMaxAffordableQuantity('precinct', gameState.upgrades.precinct, gameState.respectPoints)
                              : new Decimal(purchaseQuantity)
                          )
                    )} RP
                    {purchaseQuantity !== 1 && (
                      <span className="ml-1 text-green-300">
                        ({purchaseQuantity === 'max' ? getMaxAffordableQuantity('precinct', gameState.upgrades.precinct, gameState.respectPoints).toString() : purchaseQuantity}x)
                      </span>
                    )}
                  </div>
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
                  <div className="font-semibold text-sm">🤖 AI System ({gameState.upgrades.automation.toString()})</div>
                  <div className="text-xs text-purple-200">
                    {purchaseQuantity === 1 ? '+50% passive income' : `+${(purchaseQuantity === 'max' ? getMaxAffordableQuantity('automation', gameState.upgrades.automation, gameState.respectPoints) : new Decimal(purchaseQuantity)).mul(50).toString()}% passive income`}
                  </div>
                  <div className="text-xs text-yellow-300">
                    Cost: {formatNumber(
                      purchaseQuantity === 1 
                        ? getUpgradeCost('automation', gameState.upgrades.automation)
                        : getBulkUpgradeCost('automation', gameState.upgrades.automation, 
                            purchaseQuantity === 'max' 
                              ? getMaxAffordableQuantity('automation', gameState.upgrades.automation, gameState.respectPoints)
                              : new Decimal(purchaseQuantity)
                          )
                    )} RP
                    {purchaseQuantity !== 1 && (
                      <span className="ml-1 text-purple-300">
                        ({purchaseQuantity === 'max' ? getMaxAffordableQuantity('automation', gameState.upgrades.automation, gameState.respectPoints).toString() : purchaseQuantity}x)
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {gameState.legacyPoints.gt(0) || canPrestige() ? (
              <div className="bg-purple-800/50 rounded-lg p-6 backdrop-blur-sm border border-purple-600/30 mb-6">
                <h3 className="text-xl font-bold mb-4">🏆 Legacy System</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Legacy Points:</span>
                    <span className="text-purple-300 font-bold">{formatNumber(gameState.legacyPoints)}</span>
                  </div>
                  {gameState.legacyPoints.gt(0) && (
                    <>
                      <div className="flex justify-between">
                        <span>Income Bonus:</span>
                        <span className="text-green-300">+{getLegacyMultiplier().sub(1).mul(100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cost Reduction:</span>
                        <span className="text-blue-300">-{new Decimal(1).sub(getLegacyCostReduction()).mul(100).toFixed(0)}%</span>
                      </div>
                      {gameState.legacyUpgrades.equipment.gt(0) && (
                        <div className="flex justify-between">
                          <span>Rank Acceleration:</span>
                          <span className="text-orange-300">-{new Decimal(1).sub(getRankRequirementReduction()).mul(100).toFixed(1)}%</span>
                        </div>
                      )}
                    </>
                  )}
                  {canPrestige() && (
                    <div className="mt-4 pt-2 border-t border-purple-500/30">
                      <div className="text-center mb-2">
                        <div className="text-purple-200">Ready to Retire!</div>
                        <div className="text-sm text-purple-300">
                          Gain {formatNumber(calculatePrestigeGain())} Legacy Points
                        </div>
                      </div>
                      <button
                        onClick={performPrestige}
                        className="w-full p-2 bg-purple-600 hover:bg-purple-500 rounded text-sm font-semibold transition-colors"
                      >
                        🏆 Retire (Prestige)
                      </button>
                    </div>
                  )}
                  {!canPrestige() && gameState.rank !== "Chief" && (
                    <div className="text-xs text-gray-400 mt-2">
                      Reach Chief rank to unlock retirement
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {gameState.legacyPoints.gt(0) && (
              <div className="bg-purple-800/50 rounded-lg p-6 backdrop-blur-sm border border-purple-600/30 mb-6">
                <h3 className="text-xl font-bold mb-4">💎 Legacy Upgrades</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => buyLegacyUpgrade('efficiency')}
                    disabled={!canAffordLegacyUpgrade('efficiency')}
                    className={`w-full text-left p-2 rounded border transition-colors ${
                      canAffordLegacyUpgrade('efficiency') 
                        ? 'bg-purple-700/50 hover:bg-purple-600/50 border-purple-500/30 cursor-pointer' 
                        : 'bg-gray-600/50 border-gray-500/30 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="font-semibold text-sm">⚡ Legacy Efficiency ({gameState.legacyUpgrades.efficiency.toString()})</div>
                    <div className="text-xs text-purple-200">+10% income per level</div>
                    <div className="text-xs text-yellow-300">Cost: {formatNumber(getLegacyUpgradeCost('efficiency'))} LP</div>
                  </button>
                  
                  <button 
                    onClick={() => buyLegacyUpgrade('wisdom')}
                    disabled={!canAffordLegacyUpgrade('wisdom')}
                    className={`w-full text-left p-2 rounded border transition-colors ${
                      canAffordLegacyUpgrade('wisdom') 
                        ? 'bg-purple-700/50 hover:bg-purple-600/50 border-purple-500/30 cursor-pointer' 
                        : 'bg-gray-600/50 border-gray-500/30 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="font-semibold text-sm">🧠 Legacy Wisdom ({gameState.legacyUpgrades.wisdom.toString()})</div>
                    <div className="text-xs text-purple-200">-2% upgrade costs per level</div>
                    <div className="text-xs text-yellow-300">Cost: {formatNumber(getLegacyUpgradeCost('wisdom'))} LP</div>
                  </button>
                  
                  <button 
                    onClick={() => buyLegacyUpgrade('equipment')}
                    disabled={!canAffordLegacyUpgrade('equipment')}
                    className={`w-full text-left p-2 rounded border transition-colors ${
                      canAffordLegacyUpgrade('equipment') 
                        ? 'bg-purple-700/50 hover:bg-purple-600/50 border-purple-500/30 cursor-pointer' 
                        : 'bg-gray-600/50 border-gray-500/30 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="font-semibold text-sm">🔨 Legacy Equipment ({gameState.legacyUpgrades.equipment.toString()})</div>
                    <div className="text-xs text-purple-200">-10% rank requirements per level</div>
                    <div className="text-xs text-yellow-300">Cost: {formatNumber(getLegacyUpgradeCost('equipment'))} LP</div>
                    {gameState.legacyUpgrades.equipment.gt(0) && (
                      <div className="text-xs text-green-300">
                        Current: -{new Decimal(1).sub(getRankRequirementReduction()).mul(100).toFixed(1)}% requirements
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="bg-yellow-800/50 rounded-lg p-6 backdrop-blur-sm border border-yellow-600/30 mb-6">
              <h3 className="text-xl font-bold mb-4">🏆 Achievements</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {gameState.achievements.filter(a => a.unlocked).length > 0 ? (
                  gameState.achievements
                    .filter(a => a.unlocked)
                    .sort((a, b) => (b.claimed ? 0 : 1) - (a.claimed ? 0 : 1)) // Unclaimed first
                    .map(achievement => (
                      <div
                        key={achievement.id}
                        className={`p-2 rounded border transition-colors ${
                          achievement.claimed 
                            ? 'bg-gray-600/50 border-gray-500/30 opacity-60' 
                            : 'bg-yellow-700/50 border-yellow-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-sm flex items-center">
                              {achievement.claimed ? '✅' : '🏆'} {achievement.title}
                            </div>
                            <div className="text-xs text-yellow-200">{achievement.description}</div>
                            <div className="text-xs text-yellow-300">
                              Reward: {achievement.reward.type === 'rp' ? `${formatNumber(achievement.reward.amount)} RP` : 
                                       achievement.reward.type === 'legacy_points' ? `${formatNumber(achievement.reward.amount)} LP` : 
                                       'Multiplier Bonus'}
                            </div>
                          </div>
                          {!achievement.claimed && (
                            <button
                              onClick={() => claimAchievement(achievement.id)}
                              className="ml-2 bg-yellow-600 hover:bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold"
                            >
                              Claim
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center text-yellow-300 text-sm py-4">
                    No achievements unlocked yet. Keep playing to earn your first achievement!
                  </div>
                )}
                
                <div className="text-center text-xs text-yellow-400 mt-4">
                  {gameState.achievements.filter(a => a.unlocked).length} / {gameState.achievements.length} achievements unlocked
                </div>
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
                  <span>{formatNumber(gameState.clickValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Passive Income:</span>
                  <span>{formatNumber(gameState.passiveIncome)}/sec</span>
                </div>
                <div className="flex justify-between">
                  <span>🔧 Equipment:</span>
                  <span>{gameState.upgrades.equipment.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>📚 Training:</span>
                  <span>{gameState.upgrades.training.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>👮 Partners:</span>
                  <span>{gameState.upgrades.partner.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>🚗 Patrol Units:</span>
                  <span>{gameState.upgrades.patrol.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>🔍 Investigations:</span>
                  <span>{gameState.upgrades.investigation.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>🏢 Precincts:</span>
                  <span>{gameState.upgrades.precinct.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>🤖 AI Systems:</span>
                  <span>{gameState.upgrades.automation.toString()}</span>
                </div>
                {gameState.legacyPoints.gt(0) && (
                  <>
                    <div className="border-t border-blue-500/30 pt-2 mt-2">
                      <div className="text-purple-200 font-semibold mb-1">Legacy Stats:</div>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Legacy Points:</span>
                      <span className="text-purple-300">{formatNumber(gameState.legacyPoints)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lifetime RP:</span>
                      <span>{formatNumber(gameState.totalRP)}</span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="mt-4 space-y-2">
                <button
                  onClick={saveGame}
                  className="w-full p-2 bg-green-600 hover:bg-green-500 rounded text-sm font-semibold transition-colors"
                >
                  💾 Save Game
                </button>
                <button
                  onClick={() => {
                    setGameState(prev => ({
                      ...prev,
                      respectPoints: new Decimal("1e15")
                    }));
                  }}
                  className="w-full p-2 bg-yellow-600 hover:bg-yellow-500 rounded text-sm font-semibold transition-colors"
                >
                  🧪 Test Big Numbers
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
