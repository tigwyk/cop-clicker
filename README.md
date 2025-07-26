# Cop-Clicker
## An incremental game about cop life

A browser-based clicker game where players progress through a police officer's career, earning respect points and climbing the ranks from Beat Cop to Chief.

## 🎮 Current Features

### Core Gameplay
- **Click Mechanics**: Click the police car to earn Respect Points (RP)
- **Currency System**: Respect Points with smart formatting (K, M, B, T)
- **Visual Feedback**: Floating "+X" animations on clicks
- **Auto-Save**: Progress automatically saved every 5 seconds to localStorage

### Progression System
- **6 Police Ranks**: Beat Cop → Detective → Sergeant → Lieutenant → Captain → Chief
- **Rank Requirements**: 0, 100, 500, 2K, 10K, 50K Respect Points
- **Rank Bonuses**: +25% multiplier to all values per rank
- **Progress Tracking**: Visual progress bar showing promotion status

### Upgrade Shop
- **Better Equipment**: +1 click value (starts at 10 RP, scales by 1.5x)
- **Training Course**: +2 click value (starts at 50 RP, scales by 1.5x)  
- **Partner Support**: +1 RP/second passive income (starts at 100 RP, scales by 1.5x)
- **Dynamic Pricing**: Costs increase exponentially with each purchase
- **Rank Synergy**: All upgrades boosted by current rank multiplier

### Statistics & UI
- **Comprehensive Stats**: Track total RP, rank, click power, passive income, and upgrades
- **Responsive Design**: Works on desktop and mobile devices
- **Police Theme**: Blue gradient background with police car emoji and themed UI

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd cop-clicker

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:3000` (or next available port).

### Other Commands
```bash
# Build for production
npm run build

# Start production server
npm start

# Type check
npx tsc --noEmit
```

## 🏗️ Technology Stack

- **Next.js 15** - React framework with App Router
- **React 19** - UI library with modern hooks
- **TypeScript** - Type safety and better DX
- **Tailwind CSS v4** - Utility-first CSS framework
- **Turbopack** - Fast development builds

## 📋 Development Roadmap

### ✅ Phase 1: Core Foundation (Complete)
- [x] Basic clicking mechanics
- [x] Respect Points currency system  
- [x] Upgrade shop with 3 upgrade types
- [x] Rank progression system (6 ranks)
- [x] Auto-save/load functionality
- [x] Visual feedback and animations
- [x] Responsive UI design

### 🔄 Phase 2: Core Progression (Planned)
- [ ] Prestige system ("Retirement" mechanic)
- [ ] Legacy Points currency
- [ ] Permanent progression bonuses
- [ ] Achievement system
- [ ] Case-solving mini-games
- [ ] Random events

### 🎯 Phase 3: Advanced Features (Future)
- [ ] Equipment system
- [ ] Department management
- [ ] Sound effects and animations
- [ ] Dark/light theme toggle
- [ ] Export/import saves

### 🌟 Phase 4: Extended Content (Future)
- [ ] Specialized units (SWAT, K-9, Detective)
- [ ] Storyline and narrative
- [ ] Social features and leaderboards
- [ ] Community challenges

## 🎯 Game Balance

- **Click Values**: Start at 1, scale with equipment and training upgrades
- **Passive Income**: Unlocked via Partner Support upgrades
- **Rank Progression**: Meaningful milestones with 25% bonuses
- **Cost Scaling**: 1.5x multiplier prevents trivial progression
- **Early Game**: First upgrade available at 10 clicks
- **Mid Game**: Rank progression provides clear goals
- **Late Game**: Exponential scaling maintains challenge

## 🤝 Contributing

This project follows the roadmap outlined in `ROADMAP.md`. See `CLAUDE.md` for technical guidance when working with Claude Code.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

