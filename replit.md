# Excel & CSV File Upload Application

## Overview

This is a web-based file upload and preview application built to handle Excel (.xlsx, .xls) and CSV files up to 1GB in size. The application provides a drag-and-drop interface for uploading files and displays a data preview table showing the first 20 rows of the uploaded file. The system uses a modern tech stack with React on the frontend and Express on the backend, following a clean, utility-focused design approach inspired by modern file management tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **React 18** with TypeScript for the UI layer
- **Vite** as the build tool and development server
- **Wouter** for client-side routing (lightweight alternative to React Router)
- **TanStack Query (React Query)** for server state management and data fetching
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for styling with a custom design system

**Design System:**
- Uses the "new-york" style variant from shadcn/ui
- Custom color scheme with CSS variables for theming
- Inter font family for typography
- Animated gradient background with backdrop blur effects
- Consistent spacing system based on Tailwind's 4, 6, 8, 12, 16, 24 scale
- Component variants for buttons, badges, and cards with hover/active elevation states

**Key Components:**
- **FileUploadZone**: Drag-and-drop area with file validation, progress tracking, and visual feedback
- **FileInfoCard**: Displays uploaded file metadata (name, size, type, row count)
- **DataPreviewTable**: Scrollable table with sticky header showing first 20 rows of data
- **AnimatedGradient**: Full-page gradient background with slow animation loop

**File Upload Flow:**
1. Client validates file type and size before upload
2. FormData submitted to `/api/upload` endpoint
3. Progress tracking during upload
4. Response contains parsed file data (headers, rows, metadata)
5. UI updates to show file info and data preview

### Backend Architecture

**Technology Stack:**
- **Express.js** server with TypeScript
- **Multer** for handling multipart/form-data file uploads
- **XLSX (SheetJS)** for parsing Excel files (.xlsx, .xls)
- **PapaParse** for parsing CSV files
- In-memory storage for user data (MemStorage class)

**File Processing:**
- Multer configured with memory storage (files stored in buffer)
- 1GB file size limit enforced at middleware level
- Whitelist-based file type validation (MIME type checking)
- Server-side parsing extracts headers and row data
- Returns first 100 rows for preview with total row count

**API Endpoints:**
- `POST /api/upload`: Accepts single file upload, validates format, parses content, returns structured data

**Request/Response Logging:**
- Custom middleware logs all API requests with method, path, status, duration
- JSON responses captured and logged (truncated to 80 characters)

### Database & State Management

**Current State:**
- Database configuration present (Drizzle ORM with PostgreSQL via Neon)
- Schema file exists but not yet utilized for file storage
- User schema defined with in-memory storage implementation
- No persistent storage of uploaded files (files processed in-memory only)

**Drizzle Configuration:**
- PostgreSQL dialect
- Schema location: `./shared/schema.ts`
- Migrations output: `./migrations`
- Connection via `DATABASE_URL` environment variable

**Future Consideration:**
The application is configured for PostgreSQL through Drizzle ORM but currently operates without database persistence. File uploads are processed transiently—parsed and returned to the client without storage.

### Session Management

**Session Infrastructure:**
- `connect-pg-simple` package installed for PostgreSQL-backed sessions
- Session store would integrate with Express session middleware
- Currently using in-memory user storage via MemStorage class

### Build & Deployment

**Development:**
- `npm run dev`: Runs TypeScript server directly via tsx
- Vite dev server with HMR
- Replit-specific plugins for development banner and cartographer

**Production:**
- `npm run build`: 
  - Vite builds client to `dist/public`
  - esbuild bundles server to `dist/index.js`
- `npm start`: Runs production server from bundled output

**Project Structure:**
```
/client        - React frontend source
/server        - Express backend source  
/shared        - Shared types and schemas (Zod)
/dist          - Production build output
/migrations    - Drizzle database migrations
```

## External Dependencies

### File Processing Libraries
- **xlsx**: Excel file parsing (.xlsx, .xls formats)
- **papaparse**: CSV file parsing with configurable options
- **multer**: Multipart form data handling for file uploads (1GB size limit)

### UI Component Libraries
- **@radix-ui/***: Comprehensive set of unstyled, accessible UI primitives (accordion, dialog, dropdown, popover, select, tabs, toast, tooltip, etc.)
- **shadcn/ui**: Pre-styled components built on Radix UI
- **lucide-react**: Icon library for UI elements
- **cmdk**: Command palette component

### Styling & Design
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: CVA for component variants
- **tailwind-merge**: Utility for merging Tailwind classes
- **Google Fonts**: Inter font family

### Database & ORM
- **drizzle-orm**: TypeScript ORM for SQL databases
- **drizzle-kit**: Migration and schema management tools
- **@neondatabase/serverless**: PostgreSQL serverless driver for Neon
- **connect-pg-simple**: PostgreSQL session store (for future use)

### State Management & Data Fetching
- **@tanstack/react-query**: Server state management, caching, and synchronization
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Validation resolver for react-hook-form
- **zod**: TypeScript-first schema validation (used in shared schemas)

### Development Tools
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Replit-specific development tooling
- **@replit/vite-plugin-dev-banner**: Development environment banner

### Routing
- **wouter**: Lightweight client-side routing library (minimalist alternative to React Router)

### Build Tools
- **vite**: Frontend build tool and dev server
- **@vitejs/plugin-react**: React support for Vite
- **esbuild**: Fast JavaScript bundler (used for server bundling)
- **tsx**: TypeScript execution for development server