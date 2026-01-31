# Staffing ATS Schema - Quick Start Guide

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
cd /home/runner/work/n8n-render/n8n-render
pnpm install
```

### 2. Configure Database

```bash
# Copy environment example
cp packages/db/.env.example packages/db/.env

# Edit .env and update DATABASE_URL
# Example: DATABASE_URL="postgresql://user:password@localhost:5432/narpavi_ats?schema=public"
```

### 3. Generate Prisma Client

```bash
pnpm db:generate
```

### 4. Run Migrations

```bash
pnpm --filter @narpavi-ats/db migrate
```

### 5. Seed Database

```bash
pnpm --filter @narpavi-ats/db seed
```

## 📊 Sample Data Included

The seed script creates:

- **15 Skills** (JavaScript, TypeScript, React, Node.js, Python, Java, AWS, Docker, etc.)
- **10 Candidates** with complete profiles, resume versions, and skills
- **5 Vendors** (recruiting companies) with primary contacts
- **5 Clients** (end clients) with contact information
- **10 Jobs** across different clients with required skills
- **3 RTRs** (Right to Represent documents) - signed and ready
- **25 Applications** in various stages (SUBMITTED, SCREENING, INTERVIEWING, PLACED, etc.)
- **2 Contracts** with rate information and margin calculations
- **13 Documents** (visa docs, IDs, MSAs for vendors/candidates)
- **4 Audit Logs** showing system activity

## 🔄 Common Commands

### Reset Database (Development)

```bash
# WARNING: This deletes all data and recreates schema + seeds
pnpm --filter @narpavi-ats/db db:reset --force
```

### Open Prisma Studio (Database GUI)

```bash
pnpm db:studio
# Opens at http://localhost:5555
```

### Create a New Migration

```bash
# After changing schema.prisma
pnpm --filter @narpavi-ats/db migrate
```

### Deploy to Production

```bash
pnpm --filter @narpavi-ats/db migrate:deploy
```

## 📝 Key Schema Features

### Candidate Tracking

```typescript
// Find candidate with all relationships
const candidate = await prisma.candidate.findUnique({
  where: { email: 'john.doe@email.com' },
  include: {
    resumeVersions: { where: { isActive: true } },
    candidateSkills: { include: { skill: true } },
    applications: {
      include: {
        job: { include: { client: true } },
        vendor: true,
      },
    },
    rtrs: { where: { status: 'SIGNED' } },
  },
});
```

### Duplicate Prevention

```typescript
// The schema prevents duplicate submissions via unique constraint:
// @@unique([candidateId, jobId, duplicateCheckDate])

// Set duplicateCheckDate to round to nearest 90-day period
const now = new Date();
const duplicateCheckDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);

const application = await prisma.application.create({
  data: {
    candidateId: 'uuid',
    jobId: 'uuid',
    vendorId: 'uuid',
    rtrId: 'uuid',
    duplicateCheckDate, // Prevents duplicate within same 90-day period
    currentStage: 'SUBMITTED',
  },
});
```

### RTR Validation

```typescript
// Check if candidate has valid RTR before submission
const validRTR = await prisma.rightToRepresent.findFirst({
  where: {
    candidateId: candidate.id,
    status: 'SIGNED',
    validFrom: { lte: new Date() },
    validUntil: { gte: new Date() },
    deletedAt: null,
  },
});

if (!validRTR) {
  throw new Error('Valid RTR required before submission');
}
```

### Soft Delete Pattern

```typescript
// Soft delete a candidate (keeps in database)
await prisma.candidate.update({
  where: { id: candidateId },
  data: { deletedAt: new Date() },
});

// Always filter out soft-deleted records
const activeJobs = await prisma.job.findMany({
  where: {
    status: 'OPEN',
    deletedAt: null, // Important!
  },
});
```

### Margin Calculations

```typescript
// Create contract with rate and auto-calculated margins
const candidateRate = 80; // $80/hr
const billRate = 120; // $120/hr

const contract = await prisma.contract.create({
  data: {
    applicationId: app.id,
    candidateId: candidate.id,
    vendorId: vendor.id,
    contractType: 'C2C',
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    rates: {
      create: {
        candidateRate,
        billRate,
        margin: billRate - candidateRate, // $40
        marginPercent: ((billRate - candidateRate) / billRate) * 100, // 33.33%
        payType: 'HOURLY',
        effectiveFrom: new Date(),
      },
    },
  },
});
```

### Audit Logging

```typescript
// Log important changes
await prisma.auditLog.create({
  data: {
    entityType: 'Application',
    entityId: application.id,
    action: 'UPDATE',
    changedBy: 'user@example.com',
    oldValues: { currentStage: 'SUBMITTED' },
    newValues: { currentStage: 'INTERVIEWING' },
    changes: {
      currentStage: {
        from: 'SUBMITTED',
        to: 'INTERVIEWING',
      },
    },
    metadata: {
      interviewDate: '2024-02-15',
      interviewType: 'Phone Screen',
    },
  },
});
```

## 🔍 Search Examples

### Search Candidates by Skills

```typescript
const candidates = await prisma.candidate.findMany({
  where: {
    candidateSkills: {
      some: {
        skill: {
          name: { in: ['React', 'TypeScript'] },
        },
        proficiency: { in: ['ADVANCED', 'EXPERT'] },
        yearsOfExp: { gte: 3 },
      },
    },
    deletedAt: null,
  },
  include: {
    candidateSkills: {
      include: { skill: true },
    },
  },
});
```

### Find Jobs by Client and Status

```typescript
const jobs = await prisma.job.findMany({
  where: {
    client: {
      name: { contains: 'TechCorp', mode: 'insensitive' },
    },
    status: 'OPEN',
    deletedAt: null,
  },
  include: {
    jobSkills: {
      include: { skill: true },
      where: { required: true },
    },
    applications: {
      where: { status: 'ACTIVE' },
    },
  },
  orderBy: { createdAt: 'desc' },
});
```

### Application Pipeline Report

```typescript
const pipeline = await prisma.application.groupBy({
  by: ['currentStage'],
  where: {
    status: 'ACTIVE',
    deletedAt: null,
  },
  _count: {
    id: true,
  },
  orderBy: {
    _count: {
      id: 'desc',
    },
  },
});

// Result: { currentStage: 'INTERVIEWING', _count: { id: 15 } }
```

### Vendor Performance

```typescript
const vendorStats = await prisma.vendor.findMany({
  where: { deletedAt: null },
  include: {
    applications: {
      where: { deletedAt: null },
      select: {
        currentStage: true,
        status: true,
      },
    },
    _count: {
      select: {
        applications: true,
      },
    },
  },
});

// Calculate placement rate per vendor
const vendorMetrics = vendorStats.map((vendor) => ({
  vendor: vendor.name,
  totalSubmissions: vendor._count.applications,
  placed: vendor.applications.filter((a) => a.currentStage === 'PLACED').length,
  placementRate:
    (vendor.applications.filter((a) => a.currentStage === 'PLACED').length /
      vendor._count.applications) *
    100,
}));
```

## 📚 Additional Resources

- **Full Schema Documentation**: See `SCHEMA_DOCUMENTATION.md`
- **Prisma Docs**: https://www.prisma.io/docs
- **Database Diagram**: Generate with `npx prisma studio`

## ⚠️ Important Notes

1. **Always filter by `deletedAt: null`** to exclude soft-deleted records
2. **Validate RTR** before allowing application submissions
3. **Use transactions** for multi-step operations
4. **Log important changes** to AuditLog table
5. **Never hard delete** unless required by GDPR/compliance

## 🐛 Troubleshooting

### Prisma Client Not Found

```bash
pnpm db:generate
```

### Migration Errors

```bash
# Reset and recreate (development only)
pnpm --filter @narpavi-ats/db db:reset --force
```

### Connection Issues

```bash
# Test database connection
sudo -u postgres psql -d narpavi_ats -c "SELECT 1;"
```

## 🎯 Next Steps

1. Build GraphQL resolvers using this schema
2. Implement RTR validation middleware
3. Add duplicate submission check in application creation
4. Create audit logging middleware
5. Build search/filter APIs with proper indexing
6. Implement soft delete filters globally
7. Add document upload/download functionality
8. Create reporting dashboards using aggregation queries
