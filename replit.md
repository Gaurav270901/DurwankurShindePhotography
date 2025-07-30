# Photography Portfolio Management System

## Overview

This is a full-stack photography portfolio management system built with Express.js backend and React frontend. The application allows photographers to showcase their work in organized galleries, manage photo uploads, handle contact inquiries, and provides an admin dashboard for content management. It features Replit authentication for secure admin access and a responsive design using shadcn/ui components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Express.js Server**: RESTful API with middleware for authentication, logging, and error handling
- **Database Layer**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit OpenID Connect integration with session management
- **File Storage**: Local file system with image processing via Sharp for optimization
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple

### Frontend Architecture
- **React SPA**: Single-page application using Wouter for client-side routing
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state and React hooks for local state
- **Build Tool**: Vite for development and production builds

### Key Components

#### Database Schema
- **Users**: Stores admin user information for Replit Auth
- **Sections**: Photography categories/galleries with slug-based routing
- **Photos**: Image metadata with relationships to sections, including view tracking
- **Contact Messages**: Customer inquiries with read status tracking
- **Sessions**: Authentication session storage

#### API Endpoints
- **Public Routes**: Gallery viewing, photo display, contact form submission
- **Protected Admin Routes**: Photo/section CRUD operations, message management, analytics
- **Auth Routes**: Login/logout, user profile management
- **File Routes**: Image serving with proper MIME types and caching

#### Authentication Flow
- Replit OpenID Connect for secure admin authentication
- Session-based authentication with PostgreSQL storage
- Middleware protection for admin routes
- Automatic token refresh and session management

## Data Flow

1. **Public Access**: Users browse galleries, view photos (with view tracking), and submit contact forms
2. **Admin Authentication**: Photographers log in via Replit Auth to access admin dashboard
3. **Content Management**: Admins upload photos with metadata, organize into sections, and manage contact messages
4. **Image Processing**: Uploaded images are processed with Sharp for optimization and stored locally
5. **Analytics**: View counts and statistics are tracked for portfolio performance insights

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit OpenID Connect service
- **Image Processing**: Sharp for server-side image optimization
- **UI Components**: Radix UI primitives with shadcn/ui styling

### Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Database Migrations**: Drizzle Kit for schema management
- **Development Server**: Hot module replacement with Vite middleware

## Deployment Strategy

### Production Build Process
1. Frontend assets built with Vite and output to `dist/public`
2. Backend compiled with esbuild for Node.js ESM format
3. Database schema pushed via Drizzle migrations
4. Environment variables configured for database and session secrets

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string (required)
- `SESSION_SECRET`: Session encryption key (required)
- `REPLIT_DOMAINS`: Allowed domains for OIDC (required for auth)
- `ISSUER_URL`: OpenID Connect issuer endpoint (optional, defaults to Replit)

### File System Requirements
- `uploads/` directory for processed images with appropriate permissions
- `migrations/` directory for database schema versions
- Static file serving for uploaded images via Express

The system is designed for deployment on Replit with automatic database provisioning, but can be adapted for other cloud platforms with PostgreSQL support.