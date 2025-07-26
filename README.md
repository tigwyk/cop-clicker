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

### Upgrade System
**👤 Click Upgrades:**
- **🔧 Equipment**: +1 click value (starts at 10 RP, 1.4x scaling)
- **📚 Training**: +2 click value (starts at 25 RP, 1.6x scaling)

**💰 Passive Income Generators:**
- **👮 Partner**: +1 RP/sec (starts at 15 RP, 1.3x scaling)
- **🚗 Patrol Unit**: +3 RP/sec (starts at 50 RP, 1.5x scaling)
- **🔍 Investigation**: +12 RP/sec (starts at 200 RP, 1.7x scaling)
- **🏢 Precinct**: +50 RP/sec (starts at 1K RP, 2.0x scaling)

**⚡ Automation:**
- **🤖 AI System**: +50% passive income multiplier (starts at 5K RP, 2.5x scaling)

**Progression Design:**
- Gentler cost scaling for early passive income access
- Multiple tiers of passive generators for meaningful progression
- Automation multipliers for exponential growth
- Reduced emphasis on clicking in favor of strategic upgrading

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

**Idle-Friendly Design:**
- **Early Passive Access**: First passive income at just 15 RP (15 clicks)
- **Tiered Progression**: Multiple passive generators unlock meaningful growth stages
- **Reduced Click Dependence**: Passive income quickly overtakes clicking
- **Automation Rewards**: AI systems provide exponential scaling for dedicated players

**Progression Curve:**
- **Early Game** (0-100 RP): Learn clicking, unlock first Partner
- **Mid Game** (100-1K RP): Build passive income portfolio, achieve Detective rank
- **Late Game** (1K+ RP): Focus on high-tier generators and automation
- **End Game** (5K+ RP): Automation multipliers create exponential growth

**Cost Scaling:**
- **Gentle Early Scaling**: 1.3x-1.6x for early upgrades
- **Strategic Late Scaling**: 2.0x-2.5x for high-tier content
- **Rank Bonuses**: +25% per rank affects all income sources

## 🤝 Contributing

This project follows the roadmap outlined in `ROADMAP.md`. See `CLAUDE.md` for technical guidance when working with Claude Code.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

