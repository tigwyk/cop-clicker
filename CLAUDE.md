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
Phase 1 implementation is complete with the following features:
- Core clicking mechanic with police car button
- Respect Points currency system with number formatting (K, M, B, T)
- Three upgrade types: Equipment (+1 click), Training (+2 click), Partner (+1 RP/sec)
- Rank progression system (Beat Cop → Detective → Sergeant → Lieutenant → Captain → Chief)
- Rank-based bonuses (+25% per rank to all values)
- Auto-save/load functionality using localStorage
- Visual click feedback with floating numbers
- Passive income generation
- Progress bar showing promotion progress
- Responsive design with police theme