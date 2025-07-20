# Memory Patterns Game - Replit Architecture Guide

## Overview

This is a full-stack web application for a memory pattern game built with React, TypeScript, Express.js, and PostgreSQL. The application features a sophisticated game engine with level progression, leaderboards, and secret code unlocking mechanisms. It uses modern web technologies including shadcn/ui components, Tailwind CSS, and Drizzle ORM for database management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite as the build tool
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and dark mode support
- **State Management**: React hooks with custom game state management via `useGameState`
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful endpoints with JSON responses
- **Error Handling**: Centralized error middleware with structured error responses
- **Development**: Vite integration for hot module replacement in development

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Code-first approach with TypeScript schema definitions
- **Migrations**: Drizzle Kit for database migrations and schema changes

## Key Components

### Game Engine
The core game logic is managed through a custom `useGameState` hook that handles:
- **Game Modes**: Level-based progression and challenge mode
- **Game Phases**: Idle, showing pattern, waiting, playing, complete, and failed states
- **Pattern Generation**: Dynamic color sequence generation with increasing difficulty
- **Timer Management**: Real-time countdown with game phase transitions
- **Score Calculation**: Complex scoring system with time and accuracy bonuses
- **Level Progression**: Unlockable levels with secret code generation

### UI Component System
- **Modular Design**: Reusable UI components from shadcn/ui
- **Game-Specific Components**: Custom game board, header, sidebar, and modal components
- **Responsive Layout**: Mobile-first design with adaptive layouts
- **Accessibility**: Full keyboard navigation and screen reader support
- **Theme Support**: Light and dark mode with CSS custom properties

### Data Storage Strategy
- **Dual Storage**: Memory-based storage for development with PostgreSQL production schema
- **Game State Persistence**: Local storage for game progress and unlocked levels
- **Leaderboard System**: Server-side persistence with score validation
- **Schema Design**: Normalized tables for users and leaderboard entries

## Data Flow

### Game Flow
1. **Initialization**: Load saved game state from localStorage
2. **Pattern Generation**: Server or client generates color sequences
3. **User Input**: Capture and validate player pattern reproduction
4. **Score Calculation**: Real-time scoring with multiple bonus factors
5. **Progression**: Level unlocking and secret code generation
6. **Persistence**: Save progress locally and submit scores to server

### API Communication
- **GET /api/leaderboard**: Retrieve top scores with player rankings
- **POST /api/leaderboard**: Submit new scores with validation
- **Error Handling**: Structured error responses with appropriate HTTP status codes
- **Data Validation**: Zod schema validation for all API inputs

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Query for state management
- **Build Tools**: Vite for development and production builds, esbuild for server bundling
- **Database**: Drizzle ORM, Neon Database serverless PostgreSQL connection
- **Validation**: Zod for runtime type checking and API validation

### UI and Styling
- **Component Library**: Radix UI primitives for accessible component foundations
- **Styling**: Tailwind CSS with PostCSS for processing
- **Icons**: Lucide React for consistent iconography
- **Utilities**: clsx and tailwind-merge for conditional styling

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **Code Quality**: ESLint configuration through Vite
- **Replit Integration**: Runtime error modal and cartographer plugins

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: esbuild bundles Express server to `dist/index.js`
- **Static Assets**: Frontend assets served by Express in production
- **Environment**: NODE_ENV-based configuration for development and production

### Development Workflow
- **Hot Reloading**: Vite middleware integration for instant updates
- **Database**: Environment variable configuration for database connections
- **Logging**: Request/response logging with performance metrics
- **Error Handling**: Development error overlays with production error pages

### Production Considerations
- **Database**: PostgreSQL connection via DATABASE_URL environment variable
- **Static Serving**: Express serves built React application
- **Error Boundaries**: Graceful error handling and user feedback
- **Performance**: Optimized builds with code splitting and lazy loading