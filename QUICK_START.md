# Quick Start Guide - Narpavi ATS

## Getting Started in 3 Steps

### Step 1: Clone and Setup (GitHub Codespaces - Recommended)

1. **Open in Codespaces**
   - Click "Code" → "Create codespace on copilot/create-narpavi-ats-mono-repo"
   - Wait for container to build (~3 minutes)
   - Dependencies auto-install

2. **Or Local Setup**
   ```bash
   git clone https://github.com/vinothsivaperumal/n8n-render.git
   cd n8n-render
   corepack enable
   pnpm install
   ```

### Step 2: Setup Database

```bash
# Generate Prisma Client
pnpm db:generate

# Run migrations (creates tables)
pnpm db:migrate

# Seed with sample data
pnpm db:seed
```

**Sample Data Created:**

- 2 users (admin@narpavi-ats.com, recruiter@narpavi-ats.com)
- 2 job postings (Full Stack Developer, Product Manager)

### Step 3: Start Development

```bash
# Start everything (web + api)
pnpm dev
```

**Services Available:**

- 🌐 Web App: http://localhost:3000
- 🔌 GraphQL API: http://localhost:4000/graphql
- 📊 Prisma Studio: `pnpm db:studio` (in new terminal)

## Example GraphQL Queries

### Get All Jobs

```graphql
query GetJobs {
  jobs {
    id
    title
    description
    department
    location
    type
    status
    createdAt
  }
}
```

### Get Specific Job with Applications

```graphql
query GetJob($id: ID!) {
  job(id: $id) {
    id
    title
    description
    applications {
      id
      status
      user {
        name
        email
      }
    }
  }
}
```

### Create New Job

```graphql
mutation CreateJob {
  createJob(
    title: "Backend Engineer"
    description: "We need a skilled backend engineer"
    department: "Engineering"
    location: "San Francisco, CA"
    type: FULL_TIME
  ) {
    id
    title
    status
  }
}
```

### Create Application

```graphql
mutation CreateApplication {
  createApplication(
    userId: "clxxx..." # Use actual user ID
    jobId: "job-1"
    coverLetter: "I am very interested in this position..."
    resumeUrl: "https://example.com/resume.pdf"
  ) {
    id
    status
    createdAt
  }
}
```

### Update Application Status

```graphql
mutation UpdateStatus {
  updateApplicationStatus(
    id: "clxxx..." # Application ID
    status: INTERVIEW
  ) {
    id
    status
    user {
      name
      email
    }
  }
}
```

## Development Workflow

### 1. Making Changes to API

```bash
# Edit files in apps/api/src/
cd apps/api

# The dev server auto-restarts on changes
pnpm dev
```

**Common API Tasks:**

- Add new GraphQL types: Edit `src/graphql/schema.ts`
- Add resolvers: Edit `src/resolvers/index.ts`
- Test with GraphQL Playground: http://localhost:4000/graphql

### 2. Making Changes to Web App

```bash
# Edit files in apps/web/src/
cd apps/web

# Hot reload is automatic
pnpm dev
```

**Common Web Tasks:**

- Add new pages: Create in `src/app/`
- Add components: Create in `src/components/`
- Add queries: Edit `src/graphql/queries.ts`

### 3. Database Changes

```bash
# Edit the schema
nano packages/db/prisma/schema.prisma

# Create migration
pnpm db:migrate

# Regenerate Prisma Client
pnpm db:generate
```

### 4. Adding Shared Code

```bash
# Add types
nano packages/shared/src/types/index.ts

# Add utilities
nano packages/shared/src/utils/index.ts

# Rebuild (if needed)
pnpm --filter @narpavi-ats/shared build
```

## Testing Your Changes

### Type Checking

```bash
# Check all workspaces
pnpm typecheck

# Check specific workspace
pnpm --filter @narpavi-ats/web typecheck
```

### Linting

```bash
# Lint all workspaces
pnpm lint

# Lint specific workspace
pnpm --filter @narpavi-ats/api lint
```

### Formatting

```bash
# Format all code
pnpm format

# Check formatting only
pnpm format:check
```

### Building

```bash
# Build everything
pnpm build

# Build specific workspace
pnpm --filter @narpavi-ats/web build
```

## Common Issues & Solutions

### Issue: Port Already in Use

**Problem:** `Error: Port 3000 is already in use`

**Solution:**

```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9
# Or use different port
PORT=3001 pnpm dev
```

### Issue: Database Connection Failed

**Problem:** `Can't reach database server`

**Solution:**

1. Check PostgreSQL is running
2. Verify DATABASE_URL in `.env` files
3. Test connection: `psql $DATABASE_URL`

### Issue: Prisma Client Not Found

**Problem:** `Cannot find module '@prisma/client'`

**Solution:**

```bash
pnpm db:generate
```

### Issue: GraphQL Schema Errors

**Problem:** `Unknown type` errors in GraphQL

**Solution:**

1. Check schema.ts for typos
2. Verify enum values match
3. Restart API server

## Useful Commands

### Database Management

```bash
# Open Prisma Studio (GUI)
pnpm db:studio

# Reset database (⚠️ DELETES ALL DATA)
pnpm --filter @narpavi-ats/db db:reset

# Push schema without migrations
pnpm --filter @narpavi-ats/db db:push
```

### Package Management

```bash
# Add dependency to web app
pnpm --filter @narpavi-ats/web add package-name

# Add dev dependency to root
pnpm add -D -w package-name

# Update all dependencies
pnpm update --recursive
```

### Git Workflow

```bash
# Stage changes
git add .

# Commit (triggers pre-commit hooks)
git commit -m "feat: add new feature"

# Push
git push
```

## Next Steps

1. **Authentication** - Add JWT or OAuth
2. **File Uploads** - Integrate with S3/CloudFlare
3. **Email Notifications** - Add SendGrid/Mailgun
4. **Testing** - Add Jest + React Testing Library
5. **CI/CD** - Setup GitHub Actions
6. **Monitoring** - Add Sentry/DataDog

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Apollo Client Docs](https://www.apollographql.com/docs/react)
- [Prisma Docs](https://www.prisma.io/docs)
- [PNPM Docs](https://pnpm.io)
- [GraphQL Docs](https://graphql.org/learn)

## Need Help?

- Check `README.md` for detailed setup instructions
- Review `IMPLEMENTATION_SUMMARY.md` for architecture details
- Open an issue on GitHub
- Check the GraphQL Playground for API documentation
