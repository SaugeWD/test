# ArchNet Jordan - Replit Configuration

## Overview

ArchNet Jordan is a fully functional architectural community platform designed to connect architects, students, and professionals in Jordan. The platform provides role-based dashboards, real architectural resources (books, tools, competitions), project management, research publication, and social networking features.

The frontend was originally generated using v0.dev and has been migrated to a clean React/Vite implementation. The backend is built with Express.js and PostgreSQL using Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

**Design Constraint**: The existing frontend UI must be preserved exactly as-is. No visual changes, layout modifications, or component redesigns. Only backend integration and data replacement should occur.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, React Context for auth and theme
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **Build Tool**: Vite with path aliases (@/ for client/src, @shared/ for shared)

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints under /api prefix
- **Authentication**: JWT-based with HTTP-only cookies
- **Password Hashing**: bcrypt
- **Authorization**: Role-based middleware (admin, firm, engineer, student)

### Database Layer
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: shared/schema.ts (shared between frontend and backend)
- **Migrations**: drizzle-kit with migrations stored in /migrations

### User Roles & Permissions
- **Admin**: Full system control, user management, content moderation, approvals
- **Firm**: Office profile, publish projects, post jobs, host workshops
- **Engineer**: Professional profile, publish projects/research/news (with approval)
- **Student**: Student profile, upload student projects, request publishing permissions

### Key Data Models
- Users (with roles: admin, firm, engineer, student; verification types: architect, firm, student, educator)
- Posts (text, project, competition, news types)
- Projects (with plans, elevations, sections, concept diagrams)
- Competitions, Books, Jobs, Research, Tools, News
- Social features: Follows, Likes, Comments, SavedItems, Messages, Notifications

### Content Moderation
- Research and News submissions default to "pending" status
- Admin approves/rejects content via Admin Dashboard
- Only approved content visible publicly (except to authors who can see their own pending items)

### Pages & Routes
- `/` - Home page
- `/feed` - Social feed
- `/projects` - Projects gallery with add project form
- `/competitions` - Architectural competitions
- `/books` - Architectural books library
- `/tools` - Software & tools hub
- `/research` - Research papers hub
- `/news` - Architectural news
- `/jobs` - Job listings
- `/community` - Community members
- `/context` - Context systems (History, Environmental, Styles, Structures)
- `/dashboard` - Role-specific user dashboard
- `/admin` - Admin dashboard (admin only)
- `/settings` - User settings & preferences
- `/profile/:username` - User profiles
- `/login` - Authentication

### API Structure
All API routes are registered in server/routes.ts:
- Auth: /api/auth/register, /api/auth/login, /api/auth/logout, /api/auth/me
- Admin: /api/admin/users, /api/admin/stats, /api/admin/pending-content, /api/admin/content/:type/:id/approve|reject
- Content CRUD endpoints for all major entities
- Protected routes use JWT middleware (authenticateToken)
- Admin routes use requireAdmin middleware
- Optional auth middleware for public routes that benefit from user context

### Seeded Data
- 22 real architectural books across 5 categories (design, theory, engineering, urbanism, drawing)
- 18 real architectural software tools (AutoCAD, Revit, Rhino, etc.)
- 15 real architectural competitions (Pritzker Prize, RIBA Stirling Prize, etc.)

### Build Configuration
- Development: tsx for TypeScript execution with Vite dev server
- Production: esbuild bundles server, Vite builds client to dist/public
- Script: script/build.ts handles production builds

## External Dependencies

### Database
- PostgreSQL (DATABASE_URL environment variable required)
- Connection pooling via pg.Pool

### Authentication
- jsonwebtoken for JWT token generation/verification
- bcrypt for password hashing
- cookie-parser for HTTP-only cookie handling

### Environment Variables Required
- DATABASE_URL: PostgreSQL connection string
- SESSION_SECRET: JWT signing secret (defaults to hardcoded fallback for development)

### Third-Party UI Libraries
- Radix UI (full primitive suite)
- Lucide React (icons)
- cmdk (command palette)
- class-variance-authority, clsx, tailwind-merge (styling utilities)

### Development Tools
- Replit-specific Vite plugins for dev banner and runtime error overlay
- drizzle-kit for database schema management

## Recent Changes
- Added role-based user system with 4 roles (admin, firm, engineer, student)
- Created Admin Dashboard with user management and content moderation
- Built role-specific dashboards for all user types
- Seeded real architectural data (books, tools, competitions)
- Enhanced Projects with full upload fields (plans, elevations, sections, concepts)
- Added content moderation workflow (pending → approved/rejected)
- Created Context Systems page (History, Environmental, Styles, Structures)
- Completed Settings page with profile, account, verification, privacy sections

### Social Networking Features (Latest)
- Implemented complete follow request system with pending/accepted/rejected workflow
- Added real-time Like, Comment, and Save functionality with API integration
- Built complete messaging system with conversations, chat view, and send/reply
- Added block and mute user features with API endpoints and UI
- Profile page now shows real user activity (posts, projects, likes, comments)
- Removed all mock data from pages (Feed, Community, News, Research)
- All social features now use real API data via TanStack Query mutations

### Social API Endpoints
- Follow requests: GET /api/follow-requests, POST /api/follow-requests/:id/accept|reject
- Block: POST /api/block, DELETE /api/block/:userId, GET /api/blocked
- Mute: POST /api/mute, DELETE /api/mute/:userId, GET /api/muted
- Messages check for blocked users before sending
- Feed filters out posts from muted users

### New Routes
- `/messages` - Complete messaging system with conversations and chat
- `/activity` - User's real posts and saved items
