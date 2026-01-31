# Narpavi ATS - Applicant Tracking System

A modern, full-stack Applicant Tracking System built with Next.js, TypeScript, GraphQL, and PostgreSQL.

## 📋 Project Structure

This is a monorepo managed with PNPM workspaces:

```
narpavi-ats/
├── apps/
│   ├── web/           # Next.js frontend with Apollo Client
│   └── api/           # GraphQL API server (Node.js + TypeScript)
├── packages/
│   ├── db/            # Prisma schema and database utilities
│   └── shared/        # Shared types and utilities
├── .devcontainer/     # GitHub Codespaces configuration
└── package.json       # Root workspace configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20 or higher
- PNPM 8.x or higher
- PostgreSQL 16 (or use the devcontainer)

### Option 1: GitHub Codespaces (Recommended)

1. Click the "Code" button in GitHub and select "Create codespace on main"
2. Wait for the devcontainer to build (includes Node 20, PNPM, and PostgreSQL)
3. Once ready, the environment will auto-install dependencies
4. Run the migrations:
   ```bash
   pnpm db:migrate
   ```
5. Seed the database:
   ```bash
   pnpm db:seed
   ```
6. Start all services:
   ```bash
   pnpm dev
   ```
7. Access the applications:
   - Web: http://localhost:3000
   - API: http://localhost:4000/graphql

### Option 2: Local Development

#### 1. Install Dependencies

```bash
# Enable PNPM if not already enabled
corepack enable

# Install all dependencies
pnpm install
```

#### 2. Set Up Environment Variables

Copy the example environment files:

```bash
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env
cp packages/db/.env.example packages/db/.env
```

Update the `DATABASE_URL` in each `.env` file to match your PostgreSQL connection string:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/narpavi_ats?schema=public"
```

#### 3. Set Up Database

Generate Prisma client:

```bash
pnpm db:generate
```

Run database migrations:

```bash
pnpm db:migrate
```

Seed the database with sample data:

```bash
pnpm db:seed
```

#### 4. Start Development Servers

Start all services (web, api, and database) in parallel:

```bash
pnpm dev
```

This will start:
- **Web App** on http://localhost:3000
- **API Server** on http://localhost:4000/graphql

## 📦 Available Scripts

### Root Level

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all packages and apps
- `pnpm lint` - Lint all workspaces
- `pnpm format` - Format code with Prettier
- `pnpm typecheck` - Type check all workspaces
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate` - Run database migrations
- `pnpm db:seed` - Seed the database
- `pnpm db:studio` - Open Prisma Studio

### Individual Workspaces

```bash
# Web app
pnpm --filter @narpavi-ats/web dev
pnpm --filter @narpavi-ats/web build

# API server
pnpm --filter @narpavi-ats/api dev
pnpm --filter @narpavi-ats/api build

# Database
pnpm --filter @narpavi-ats/db migrate
pnpm --filter @narpavi-ats/db studio
```

## 🗄️ Database Management

### Migrations

Create a new migration:

```bash
pnpm db:migrate
```

Deploy migrations to production:

```bash
pnpm --filter @narpavi-ats/db migrate:deploy
```

Reset database (⚠️ destructive):

```bash
pnpm --filter @narpavi-ats/db db:reset
```

### Prisma Studio

Open Prisma Studio to browse and edit data:

```bash
pnpm db:studio
```

## 🔧 Technology Stack

### Frontend (apps/web)
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Apollo Client** - GraphQL client
- **Tailwind CSS** - Utility-first CSS (configured via globals.css)

### Backend (apps/api)
- **Node.js** - JavaScript runtime
- **TypeScript** - Type-safe development
- **Apollo Server** - GraphQL server
- **Express** - Web framework
- **Prisma** - Database ORM

### Database (packages/db)
- **PostgreSQL** - Relational database
- **Prisma** - Database toolkit and ORM

### Shared (packages/shared)
- Common TypeScript types
- Utility functions
- Shared business logic

## 🧪 Code Quality

### Linting

```bash
pnpm lint
```

### Formatting

```bash
# Check formatting
pnpm format:check

# Fix formatting
pnpm format
```

### Git Hooks

This project uses Husky and lint-staged to run checks before commits:
- Prettier formatting
- ESLint checks
- TypeScript type checking

Hooks are automatically installed after `pnpm install`.

## 🚢 Deployment Options

### Option 1: Vercel (Web) + Render (API)

#### Deploy Web App to Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy from `apps/web`:
   ```bash
   cd apps/web
   vercel
   ```

3. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_GRAPHQL_URL` - Your API GraphQL endpoint

#### Deploy API to Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `pnpm install && pnpm --filter @narpavi-ats/api build`
   - **Start Command**: `pnpm --filter @narpavi-ats/api start`
   - **Environment Variables**: Add `DATABASE_URL`

### Option 2: Docker Compose

Create a `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_GRAPHQL_URL=http://api:4000/graphql

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/narpavi_ats
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=narpavi_ats

volumes:
  postgres_data:
```

### Option 3: Traditional VPS

1. Set up Node.js 20+ and PostgreSQL on your VPS
2. Clone the repository
3. Install dependencies: `pnpm install`
4. Build all packages: `pnpm build`
5. Set up environment variables
6. Run migrations: `pnpm db:migrate:deploy`
7. Use PM2 or similar to manage processes:
   ```bash
   pm2 start apps/api/dist/index.js --name narpavi-api
   pm2 start apps/web/.next/standalone/server.js --name narpavi-web
   ```

## 📚 GraphQL API

Access the GraphQL Playground at http://localhost:4000/graphql

### Example Queries

```graphql
# Get all jobs
query GetJobs {
  jobs {
    id
    title
    description
    department
    location
    type
    status
  }
}

# Create a new job
mutation CreateJob {
  createJob(
    title: "Software Engineer"
    description: "Join our amazing team"
    department: "Engineering"
    location: "Remote"
    type: FULL_TIME
  ) {
    id
    title
  }
}
```

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all tests pass: `pnpm test` (if tests are added)
4. Ensure linting passes: `pnpm lint`
5. Create a pull request

## 📝 License

MIT

## 🆘 Troubleshooting

### Database Connection Issues

If you get database connection errors:

1. Ensure PostgreSQL is running
2. Check that `DATABASE_URL` is correct in all `.env` files
3. Try connecting manually: `psql postgresql://postgres:password@localhost:5432/narpavi_ats`

### PNPM Issues

If PNPM commands fail:

```bash
# Enable PNPM via corepack
corepack enable

# Or install globally
npm install -g pnpm@8
```

### Port Already in Use

If ports 3000 or 4000 are in use:

```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9
lsof -ti:4000 | xargs kill -9
```

Or modify the port in the respective `.env` files.

## 📧 Support

For issues and questions, please open a GitHub issue.
