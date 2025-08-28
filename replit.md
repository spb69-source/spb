# Overview

This is a full-stack banking application called "Secure Professional Bank" built with React and Express. The application provides a comprehensive banking platform with separate user and admin interfaces, featuring account management, messaging, transactions, and loan applications. Users can register for accounts that require admin approval, and once approved, they can access banking services including account creation, transaction history, and communication with bank administrators.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built using React with TypeScript and follows a component-based architecture. The application uses Wouter for client-side routing and React Query for server state management. The UI is built with shadcn/ui components and styled using Tailwind CSS with a design system that supports both light and dark themes.

**Key Frontend Decisions:**
- **React with TypeScript**: Provides type safety and better developer experience
- **Wouter for routing**: Lightweight alternative to React Router for simple routing needs
- **React Query**: Handles server state management, caching, and data synchronization
- **shadcn/ui**: Pre-built accessible components that maintain consistency across the application
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development

## Backend Architecture
The backend follows a REST API architecture built with Express.js and TypeScript. It implements session-based authentication using PostgreSQL for session storage and provides real-time communication through WebSockets.

**Key Backend Decisions:**
- **Express.js**: Mature and flexible Node.js framework for API development
- **Session-based authentication**: Uses express-session with PostgreSQL storage for secure user sessions
- **Modular route structure**: Separates route definitions from the main server file for better organization
- **WebSocket integration**: Enables real-time messaging between users and administrators

## Data Storage
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The database schema includes tables for users, accounts, transactions, messages, and loan applications.

**Database Design Decisions:**
- **PostgreSQL**: Robust relational database suitable for financial applications
- **Drizzle ORM**: Provides type safety and excellent TypeScript integration
- **Neon Database**: Cloud PostgreSQL provider for simplified deployment and scaling
- **Session storage**: Dedicated sessions table for secure session management

## Authentication and Authorization
The system implements role-based access control with separate authentication flows for regular users and administrators. Users must be approved by administrators before accessing banking features.

**Security Features:**
- **Password hashing**: Uses bcrypt for secure password storage
- **Role-based access**: Separate user and admin roles with different permissions
- **Account approval workflow**: New users require admin approval before account activation
- **Session management**: Secure session handling with configurable timeouts

## Component Structure
The frontend is organized into reusable components with clear separation of concerns:
- **Page components**: Handle routing and high-level application state
- **UI components**: Reusable interface elements from shadcn/ui
- **Custom components**: Application-specific components like sidebars and chat interfaces
- **Hooks**: Custom React hooks for authentication, WebSocket connections, and other shared logic

# External Dependencies

## Database Services
- **Neon Database**: Cloud PostgreSQL hosting service
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## Frontend Libraries
- **React Query (@tanstack/react-query)**: Server state management and caching
- **React Hook Form**: Form handling and validation
- **Zod**: Runtime type validation and schema definitions
- **date-fns**: Date manipulation and formatting utilities
- **Wouter**: Lightweight client-side routing

## UI Framework
- **shadcn/ui**: Component library built on Radix UI primitives
- **Radix UI**: Unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking for JavaScript
- **ESBuild**: Fast JavaScript bundler for production builds
- **Drizzle Kit**: Database migration and schema management tools