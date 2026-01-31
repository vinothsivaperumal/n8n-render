# Staffing ATS Database Schema Documentation

## Overview

This document describes the comprehensive PostgreSQL database schema for the Staffing ATS (Applicant Tracking System). The schema is designed to manage candidates, vendors, clients, jobs, applications, contracts, and compliance requirements including Right to Represent (RTR) documents.

## Key Features

- **UUID Primary Keys**: All tables use UUID for primary keys
- **Soft Deletes**: Most entities support soft deletion via `deletedAt` field
- **Comprehensive Indexing**: Optimized for common search patterns
- **Audit Trail**: Complete audit logging for all important actions
- **Business Rules**: Built-in constraints for duplicate prevention and RTR validation

## Entity Relationships

### Core Entities

#### Candidate Management

- **Candidate**: Core candidate information with contact details and visa status
- **ResumeVersion**: Version-controlled resume storage (supports multiple versions per candidate)
- **Skill**: Master list of skills/technologies
- **CandidateSkill**: Junction table linking candidates to skills with proficiency levels

#### Vendor Management

- **Vendor**: Recruiting companies/agencies
- **VendorContact**: Multiple contacts per vendor with primary contact designation

#### Client & Job Management

- **Client**: End clients who have job openings
- **Job**: Job postings with salary/rate information
- **JobSkill**: Required skills for each job position

#### Application & Tracking

- **Application**: Candidate submissions to jobs (supports vendor submissions)
- **StageHistory**: Complete history of stage transitions
- **RightToRepresent (RTR)**: Legal authorization for vendors to represent candidates
- **Contract**: Employment contracts (C2C, W2, etc.)
- **Rate**: Rate information with margin calculations

#### Document Management

- **Document**: Polymorphic document storage (visa, ID, RTR, MSA, NDA, etc.)

#### Audit & Compliance

- **AuditLog**: Complete audit trail of all changes

## Business Rules

### Duplicate Submission Prevention

The schema enforces duplicate prevention through a unique constraint on Application:

```prisma
@@unique([candidateId, jobId, duplicateCheckDate])
```

The `duplicateCheckDate` field should be set based on your business rules (e.g., rounded to the nearest 30/60/90 days) to prevent the same candidate from being submitted to the same job and client within a configurable time window.

**Implementation Example**:

```typescript
// Prevent duplicate within 90 days
const duplicateCheckDate = new Date();
duplicateCheckDate.setDate(duplicateCheckDate.getDate() - (duplicateCheckDate.getDate() % 90));
```

### RTR Requirement

Applications can reference an RTR (`rtrId`), and business logic should validate that:

1. An RTR exists for the candidate
2. The RTR is signed by both candidate and vendor (`status = 'SIGNED'`)
3. The RTR is still valid (current date is between `validFrom` and `validUntil`)

### Soft Delete Pattern

Most entities include a `deletedAt` timestamp field. When set, the record is considered deleted but remains in the database for audit purposes.

**Best Practices**:

- Always filter on `deletedAt IS NULL` in queries
- Use indexes that include `deletedAt` for performance
- Never hard delete records unless required by compliance/GDPR

## Enums

### VisaStatus

- US_CITIZEN, GREEN_CARD, H1B, H4_EAD, L2_EAD, OPT, CPT, TN, GC_EAD, OTHER

### ApplicationStage

- SUBMITTED, SCREENING, CLIENT_SUBMITTED, INTERVIEW_SCHEDULED, INTERVIEWING
- TECHNICAL_ROUND, FINAL_ROUND, OFFER_EXTENDED, OFFER_ACCEPTED, OFFER_DECLINED
- ONBOARDING, PLACED, REJECTED, WITHDRAWN

### ContractType

- C2C (Corp-to-Corp), W2, CORP_TO_CORP, INDEPENDENT_CONTRACTOR

### DocumentType

- RESUME, VISA_DOCUMENT, ID_PROOF, PASSPORT, DRIVERS_LICENSE
- RTR_SIGNED, MSA, NDA, SOW, OFFER_LETTER, CONTRACT
- BACKGROUND_CHECK, DRUG_TEST, CERTIFICATE, OTHER

## Search Optimization

### Indexed Fields

**Candidate Search**:

```sql
-- By email (unique)
@@index([email])

-- By name (compound)
@@index([firstName, lastName])

-- By phone
@@index([phone])

-- For soft delete filtering
@@index([deletedAt])
```

**Job Search**:

```sql
-- By title
@@index([title])

-- By client
@@index([clientId])

-- By status and dates
@@index([status])
@@index([createdAt])
@@index([deletedAt])
```

**Application Tracking**:

```sql
-- By candidate/job/vendor
@@index([candidateId])
@@index([jobId])
@@index([vendorId])

-- By stage and status
@@index([currentStage])
@@index([status])

-- By submission date
@@index([submittedAt])
```

## Rate & Margin Calculations

The `Rate` model supports automatic margin calculation:

```typescript
// Example calculation
const candidateRate = 80; // $80/hr
const billRate = 120; // $120/hr
const margin = billRate - candidateRate; // $40/hr
const marginPercent = (margin / billRate) * 100; // 33.33%
```

Fields:

- `candidateRate`: What the candidate is paid
- `billRate`: What the client is charged
- `margin`: Dollar difference (billRate - candidateRate)
- `marginPercent`: Percentage margin

## Audit Logging

The `AuditLog` model captures all important changes:

```typescript
{
  entityType: 'Application',  // Type of entity changed
  entityId: 'uuid',            // UUID of the entity
  action: 'UPDATE',            // CREATE, UPDATE, DELETE, etc.
  changedBy: 'user@email.com', // Who made the change
  oldValues: {...},            // Previous state (JSON)
  newValues: {...},            // New state (JSON)
  changes: {...},              // Diff (JSON)
  metadata: {...}              // Additional context
}
```

## Sample Queries

### Find Active Applications by Stage

```typescript
const applications = await prisma.application.findMany({
  where: {
    currentStage: 'INTERVIEWING',
    status: 'ACTIVE',
    deletedAt: null,
  },
  include: {
    candidate: true,
    job: {
      include: { client: true },
    },
    vendor: true,
  },
  orderBy: {
    submittedAt: 'desc',
  },
});
```

### Check for Duplicate Submission

```typescript
const duplicateCheckDate = roundToNearestPeriod(new Date(), 90); // Your logic

const existing = await prisma.application.findUnique({
  where: {
    candidateId_jobId_duplicateCheckDate: {
      candidateId: candidate.id,
      jobId: job.id,
      duplicateCheckDate: duplicateCheckDate,
    },
  },
});

if (existing) {
  throw new Error('Duplicate submission not allowed');
}
```

### Validate RTR Before Submission

```typescript
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
  throw new Error('Valid RTR required for submission');
}
```

### Calculate Vendor Performance

```typescript
const vendorStats = await prisma.application.groupBy({
  by: ['vendorId', 'currentStage'],
  where: {
    vendorId: vendor.id,
    deletedAt: null,
  },
  _count: {
    id: true,
  },
});
```

## Migration Strategy

### Initial Setup

```bash
# Generate Prisma client
pnpm --filter @narpavi-ats/db generate

# Create initial migration
pnpm --filter @narpavi-ats/db migrate

# Seed database with sample data
pnpm --filter @narpavi-ats/db seed
```

### Reset Database (Development Only)

```bash
# WARNING: This will delete all data
pnpm --filter @narpavi-ats/db db:reset
```

## Performance Considerations

1. **Connection Pooling**: Use Prisma's built-in connection pooling
2. **Batch Operations**: Use `createMany()` for bulk inserts
3. **Select Only Needed Fields**: Use `select` to limit returned data
4. **Pagination**: Always paginate large result sets
5. **Index Usage**: Monitor query performance and add indexes as needed

## Security Considerations

1. **PII Protection**: Candidate data contains PII - ensure proper access controls
2. **Document Storage**: Store actual files in S3/blob storage, only URLs in DB
3. **Audit Trail**: Never delete audit logs
4. **Soft Deletes**: Use for compliance with data retention policies
5. **Input Validation**: Always validate/sanitize inputs before DB operations

## Compliance & GDPR

- **Right to be Forgotten**: Implement hard delete for GDPR requests
- **Data Export**: Support candidate data export requests
- **Retention Policies**: Implement automatic cleanup of old soft-deleted records
- **Audit Trail**: Maintain complete history for compliance audits

## Future Enhancements

Potential additions to consider:

- **Interview**: Dedicated interview scheduling and feedback tracking
- **Assessment**: Technical assessment results and scoring
- **Communication**: Email/SMS communication logs
- **Notification**: Event-driven notification system
- **Report**: Pre-built report definitions and schedules
- **Dashboard**: Saved dashboard configurations
- **Integration**: External system integration logs (job boards, etc.)

## Support

For schema questions or issues, refer to:

- Prisma Documentation: https://www.prisma.io/docs
- PostgreSQL Documentation: https://www.postgresql.org/docs/
