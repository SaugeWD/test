# ArchNet Jordan

## Overview

ArchNet Jordan is a comprehensive architectural community platform connecting architects, students, firms, and professionals in Jordan and beyond. The platform serves as a centralized hub for architectural resources including competitions, books, projects, research, jobs, tools, and news. It features role-based access control with distinct dashboards for admins, firms, engineers, and students, along with social features like posts, comments, likes, follows, and messaging.

## User Preferences

Preferred communication style: Simple, everyday language.

**Design Constraint**: The existing frontend UI must be preserved exactly as-is. No visual changes, layout modifications, or component redesigns. Only backend integration and data replacement should occur. The design follows a hybrid approach combining Material Design's structural clarity with contemporary architectural/tech aesthetics inspired by Linear, Vercel, and Stripe.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: TanStack React Query for server state, React Context for auth and theme
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables supporting light/dark mode theming
- **Build Tool**: Vite with path aliases (`@/` for client/src, `@shared/` for shared)

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints under `/api` prefix
- **Authentication**: JWT-based with HTTP-only cookies
- **Password Security**: bcrypt hashing
- **Authorization**: Role-based middleware supporting admin, firm, engineer, and student roles

### Database Layer
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` (shared between frontend and backend)
- **Migrations**: drizzle-kit with output to `/migrations` directory

### User Roles & Permissions
- **Admin**: Full system control, user management, content moderation, approval workflows
- **Firm**: Company profile management, project publishing, job posting, workshop hosting
- **Engineer**: Professional profile, project/research/news publishing (requires approval)
- **Student**: Student profile, student project uploads, publishing permission requests

### Key Data Models
- Users with role-based fields (firm-specific, engineer-specific, student-specific)
- Posts (text, project, competition, news types)
- Projects with architectural assets (plans, elevations, sections, concept diagrams)
- Competitions, Books, Jobs, Research, Tools, Courses, Plugins, News
- Social features: Follows, Likes, Comments, SavedItems, Messages, Notifications
- Moderation: BlockedUsers, MutedUsers, Reports

### Build & Development
- Development: `npm run dev` runs tsx server with Vite middleware
- Production build: Custom esbuild script bundles server, Vite builds client to `dist/public`
- Database sync: `npm run db:push` uses drizzle-kit to push schema changes

## External Dependencies

### Database
- **PostgreSQL**: Primary database via `DATABASE_URL` environment variable
- **Connection**: pg Pool with Drizzle ORM adapter

### Cloud Storage
- **Google Cloud Storage**: `@google-cloud/storage` for file uploads
- **Replit Object Storage**: Custom integration for presigned URL uploads via Uppy

### Authentication
- **JWT**: jsonwebtoken for token generation and verification
- **Session Secret**: `SESSION_SECRET` environment variable

### File Uploads
- **Uppy**: Client-side file upload with AWS S3 compatible presigned URLs
- **Multer**: Server-side multipart form handling

### UI Dependencies
- **Radix UI**: Accessible component primitives
- **shadcn/ui**: Pre-built component library (new-york style)
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library

### Data Validation
- **Zod**: Schema validation shared between frontend and backend
- **drizzle-zod**: Automatic Zod schema generation from Drizzle tables
- **react-hook-form**: Form handling with zod resolver