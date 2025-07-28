# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "Cop-Clicker" - an incremental game about cop life built with Next.js 15 and TypeScript. The project is currently a fresh Next.js application with default scaffolding and has not yet been customized for the game mechanics.

## Development Commands

- `npm run dev` - Start development server with Turbopack for fast refresh
- `npm run build` - Build production version
- `npm start` - Start production server
- `npm run lint` - Run Next.js linter

## Architecture & Structure

**Framework Stack:**
- Next.js 15.4.4 with App Router (src/app directory structure)
- React 19.1.0 
- TypeScript with strict mode enabled
- Tailwind CSS v4 for styling
- Turbopack for development builds

**Key Files:**
- `src/app/layout.tsx` - Root layout with Geist fonts configured
- `src/app/page.tsx` - Main homepage (currently default Next.js template)
- `tsconfig.json` - TypeScript config with path aliasing (@/* -> ./src/*)
- Path aliasing available: Use `@/` to reference files in the src directory

**Current State:**
A comprehensive incremental game with full feature implementation including:

**Core Systems (Complete):**
- Advanced clicking mechanics with police car button and visual feedback
- Big number support using break_eternity.js (K, M, B, T, Qa, Qi, Sx, Sp, Oc, No)
- Seven upgrade types: Equipment, Training, Partner, Patrol Unit, Investigation, Precinct, AI System
- Rank progression system (Beat Cop → Detective → Sergeant → Lieutenant → Captain → Chief)
- Rank-based bonuses (+25% per rank to all values)
- Auto-save/load functionality using localStorage

**Advanced Features (Complete):**
- Prestige system ("Retirement" mechanic) with Legacy Points
- Legacy upgrades: Efficiency, Wisdom, Equipment with exponential scaling
- Achievement system with real-time unlocking and notifications
- Case-solving mini-games (multiple choice, sequence, evidence analysis)
- Random events system with temporary bonuses
- Equipment system (6 slots: Radio, Badge, Weapon, Vest, Vehicle, Gadget)
- 5 rarity tiers with multiple effect types

**Polish & Experience (Complete):**
- Sound system with Web Audio API synthesis and ambient police radio
- Theme system (Dark/Light/Auto) with custom color picker
- Statistics dashboard with comprehensive tracking and analytics
- Save import/export functionality with cross-platform compatibility
- Mobile responsive design with touch optimization
- Department building system with staff management (6 buildings, 5 staff types)
- Enhanced animations with particle effects and color-coded feedback

**Technical Stack:**
- break_eternity.js for big number calculations
- Web Audio API for professional sound synthesis
- CSS Custom Properties for dynamic theming
- localStorage for persistent data with validation