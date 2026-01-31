# Staffing ATS - Entity Relationship Diagram

## Visual Schema Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STAFFING ATS DATABASE SCHEMA                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                         CANDIDATE MANAGEMENT                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────┐      ┌──────────────┐      ┌──────────────┐               │
│  │  Candidate  │──┬──>│ ResumeVersion│      │    Skill     │               │
│  └─────────────┘  │   └──────────────┘      └──────────────┘               │
│        │          │                                 │                        │
│        │          │   ┌──────────────┐             │                        │
│        │          └──>│CandidateSkill│<────────────┘                        │
│        │              └──────────────┘                                       │
│        │              (proficiency, years)                                   │
└────────┼──────────────────────────────────────────────────────────────────────┘
         │
         │   ┌──────────────────────────────────────────────────────────────┐
         │   │                  VENDOR MANAGEMENT                            │
         │   ├──────────────────────────────────────────────────────────────┤
         │   │                                                               │
         │   │  ┌────────────┐      ┌───────────────┐                       │
         │   │  │   Vendor   │─────>│ VendorContact │                       │
         │   │  └────────────┘      └───────────────┘                       │
         │   │       │                 (isPrimary)                           │
         │   └───────┼───────────────────────────────────────────────────────┘
         │           │
         │   ┌───────┼───────────────────────────────────────────────────────┐
         │   │       │           CLIENT & JOB MANAGEMENT                     │
         │   │       │   ├──────────────────────────────────────────────────┤
         │   │       │                                                       │
         │   │       │   ┌────────────┐      ┌──────────────┐              │
         │   │       │   │   Client   │─────>│     Job      │              │
         │   │       │   └────────────┘      └──────────────┘              │
         │   │       │                              │                       │
         │   │       │                              │                       │
         │   │       │   ┌──────────────┐          │                       │
         │   │       │   │   JobSkill   │<─────────┘                       │
         │   │       │   └──────────────┘                                  │
         │   │       │   (required, minYears)                              │
         │   └───────┼──────────────────────────────────────────────────────┘
         │           │
         │   ┌───────┼──────────────────────────────────────────────────────┐
         │   │       │      APPLICATION & TRACKING                          │
         │   │       │   ├──────────────────────────────────────────────────┤
         │   │       │                                                       │
         │   │       │              ┌─────────────┐                         │
         └───┼───────┼─────────────>│ Application │<────────────┐          │
             │       │              └─────────────┘             │          │
             │       │                     │                    │          │
             │       │                     │                    │          │
             │       │       ┌─────────────┴──────────┐        │          │
             │       │       │                        │        │          │
             │       │       v                        v        │          │
             │       │  ┌──────────────┐     ┌────────────┐   │          │
             │       │  │ StageHistory │     │  Contract  │   │          │
             │       │  └──────────────┘     └────────────┘   │          │
             │       │  (audit trail)              │          │          │
             │       │                             │          │          │
             │       │                        ┌────v───┐      │          │
             │       │                        │  Rate  │      │          │
             │       │                        └────────┘      │          │
             │       │                   (margin calculations)│          │
             │       └───────────────────────────────────────┼──────────────┘
             │                                               │
             │   ┌───────────────────────────────────────────┼──────────────┐
             │   │            RTR & COMPLIANCE               │              │
             │   ├───────────────────────────────────────────┼──────────────┤
             │   │                                           │              │
             │   │  ┌────────────────────┐                  │              │
             └──────>│ RightToRepresent  │──────────────────┘              │
                 │  └────────────────────┘                                 │
                 │  (signatures, validity)                                 │
                 └────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                    DOCUMENT MANAGEMENT (Polymorphic)                          │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│              ┌─────────────────────────────────┐                             │
│              │          Document               │                             │
│              ├─────────────────────────────────┤                             │
│              │ - candidateId (optional)        │<── Resume, Visa, ID         │
│              │ - vendorId (optional)           │<── MSA, NDA                 │
│              │ - clientId (optional)           │<── SOW, Contract            │
│              │ - documentType                  │                             │
│              │ - fileUrl                       │                             │
│              │ - expiryDate                    │                             │
│              └─────────────────────────────────┘                             │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                           AUDIT & TRACKING                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│              ┌─────────────────────────────────┐                             │
│              │          AuditLog               │                             │
│              ├─────────────────────────────────┤                             │
│              │ - entityType                    │                             │
│              │ - entityId                      │                             │
│              │ - action                        │                             │
│              │ - changedBy                     │                             │
│              │ - oldValues (JSON)              │                             │
│              │ - newValues (JSON)              │                             │
│              │ - changes (JSON)                │                             │
│              └─────────────────────────────────┘                             │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Key Relationships

### One-to-Many Relationships

- Candidate → ResumeVersion (1:N)
- Candidate → Application (1:N)
- Candidate → RightToRepresent (1:N)
- Candidate → Contract (1:N)
- Vendor → VendorContact (1:N)
- Vendor → Application (1:N)
- Client → Job (1:N)
- Job → Application (1:N)
- Application → StageHistory (1:N)
- Contract → Rate (1:N)

### Many-to-Many Relationships (via Junction Tables)

- Candidate ↔ Skill (via CandidateSkill)
- Job ↔ Skill (via JobSkill)

### One-to-One Relationships

- Application ↔ Contract (1:1)

### Optional Relationships

- Application → RightToRepresent (optional, for compliance)
- Application → Vendor (optional, direct applications possible)
- Document → Candidate/Vendor/Client (polymorphic)

## Data Flow

### Candidate Submission Flow

```
1. Candidate Created
   ↓
2. Resume Version Uploaded
   ↓
3. Skills Added (CandidateSkill)
   ↓
4. RTR Signed (if vendor submission)
   ↓
5. Application Created
   │ - References: Candidate, Job, Vendor (optional), RTR (optional)
   │ - Duplicate Check: [candidateId, jobId, duplicateCheckDate]
   ↓
6. Stage Transitions Tracked
   │ - StageHistory records each change
   │ - Audit logs track all modifications
   ↓
7. Contract Created (if placed)
   │ - One contract per application
   │ - Rate information with margins
   ↓
8. Documents Attached
   │ - Visa, IDs, Contracts, etc.
   └─> Complete!
```

### Business Rules in Schema

1. **Duplicate Prevention**
   - Unique constraint: `[candidateId, jobId, duplicateCheckDate]`
   - Prevents same candidate to same job within configurable period

2. **RTR Validation**
   - Application can reference RTR
   - Business logic validates: SIGNED status, valid dates

3. **Soft Deletes**
   - `deletedAt` field on major entities
   - Never hard delete (except GDPR compliance)

4. **Margin Calculations**
   - Rate table auto-calculates margins
   - margin = billRate - candidateRate
   - marginPercent = (margin / billRate) \* 100

5. **Stage Progression**
   - StageHistory provides immutable audit trail
   - Cannot modify history, only append
   - Tracks who changed what, when

## Index Strategy

### Search Performance

- **Candidate**: email, name, phone
- **Job**: title, client, status, date
- **Application**: candidate, job, vendor, stage, status
- **All**: deletedAt (for soft delete filtering)

### Query Patterns Optimized

- Find candidates by skills
- Search jobs by client and status
- Track application pipeline
- Generate vendor reports
- Audit trail queries
- Document retrieval

## Compliance Features

### Data Retention

- Soft deletes preserve history
- AuditLog tracks all changes
- StageHistory is immutable
- Document expiry tracking

### Legal Requirements

- RTR signature tracking
- IP address logging
- Timestamp all changes
- Version control (resumes)
- Polymorphic document storage

### GDPR Support

- Complete data export (all related entities)
- Hard delete capability (when required)
- Audit trail for compliance
- Data minimization ready

## Scalability Considerations

### Partitioning Ready

- UUID keys support distributed systems
- Date-based queries use indexes
- Status-based filtering optimized

### Archival Strategy

- Soft deletes enable archival
- Old applications can be moved
- Historical reporting preserved

### Performance

- 27+ indexes for fast queries
- Foreign key indexes on all relations
- Compound indexes for common patterns
- JSON fields for flexible metadata
