# GraphQL Query Collection - Sample Requests

Copy these queries into GraphQL Playground to test the API.

## Authentication

Set HTTP Headers in Playground:
```json
{
  "Authorization": "Bearer admin-token"
}
```

---

## 📊 Dashboard & Metrics

### Get Complete Dashboard

```graphql
query GetDashboard {
  dashboardMetrics(
    dateRange: {
      from: "2024-01-01T00:00:00Z"
      to: "2024-12-31T23:59:59Z"
    }
  ) {
    totalCandidates
    totalJobs
    totalApplications
    placementRate
    averageTimeToPlacement
    
    applicationsByStage {
      stage
      count
    }
    
    topVendors {
      vendor {
        id
        name
        companyName
      }
      submissionCount
      placementCount
      placementRate
    }
    
    recentActivity {
      id
      type
      description
      timestamp
    }
  }
}
```

---

## 👥 Candidate Queries

### Search Candidates with Filters

```graphql
query SearchCandidates {
  candidates(
    filter: {
      search: "developer"
      visaStatus: [US_CITIZEN, GREEN_CARD, H1B]
      location: "New York"
      minYearsOfExp: 3
      maxYearsOfExp: 10
    }
    sort: {
      field: "createdAt"
      order: DESC
    }
    pagination: {
      page: 1
      limit: 10
    }
  ) {
    data {
      id
      fullName
      email
      phone
      location
      visaStatus
      yearsOfExp
      currentRole
      createdAt
      
      candidateSkills {
        skill {
          name
          category
        }
        proficiency
        yearsOfExp
      }
      
      resumeVersions {
        version
        fileName
        fileUrl
        isActive
        createdAt
      }
      
      applications {
        id
        currentStage
        status
        job {
          title
          client {
            name
          }
        }
      }
    }
    
    pageInfo {
      total
      page
      limit
      totalPages
      hasNextPage
      hasPreviousPage
    }
  }
}
```

### Get Single Candidate Details

```graphql
query GetCandidate($id: ID!) {
  candidate(id: $id) {
    id
    fullName
    email
    phone
    location
    linkedIn
    portfolio
    yearsOfExp
    currentRole
    visaStatus
    createdAt
    updatedAt
    
    resumeVersions {
      id
      version
      fileName
      fileUrl
      summary
      isActive
      createdAt
    }
    
    candidateSkills {
      skill {
        name
        category
      }
      yearsOfExp
      proficiency
    }
    
    applications {
      id
      currentStage
      status
      submittedAt
      job {
        title
        client {
          name
        }
      }
      vendor {
        name
      }
    }
    
    rtrs {
      id
      status
      validFrom
      validUntil
      signedByCandidateAt
    }
  }
}

# Variables:
# {
#   "id": "candidate-uuid-here"
# }
```

---

## 💼 Job Queries

### Search Jobs

```graphql
query SearchJobs {
  jobs(
    filter: {
      search: "developer"
      status: [OPEN]
      employmentType: [FULL_TIME, CONTRACT]
      location: "Remote"
      minSalary: 80000
      maxSalary: 150000
      priority: [HIGH, URGENT]
    }
    sort: {
      field: "priority"
      order: DESC
    }
    pagination: {
      page: 1
      limit: 20
    }
  ) {
    data {
      id
      title
      description
      location
      employmentType
      minSalary
      maxSalary
      billRate
      status
      openings
      priority
      startDate
      endDate
      createdAt
      
      client {
        id
        name
        industry
      }
      
      jobSkills {
        skill {
          name
          category
        }
        required
        minYears
      }
      
      applications {
        id
        currentStage
        candidate {
          fullName
        }
      }
    }
    
    pageInfo {
      total
      totalPages
      hasNextPage
    }
  }
}
```

---

## 📋 Application Queries

### Get Applications with Filters

```graphql
query GetApplications {
  applications(
    filter: {
      currentStage: [SUBMITTED, SCREENING, INTERVIEWING]
      status: [ACTIVE]
      dateRange: {
        from: "2024-01-01T00:00:00Z"
        to: "2024-12-31T23:59:59Z"
      }
    }
    pagination: {
      page: 1
      limit: 25
    }
  ) {
    data {
      id
      currentStage
      status
      submittedAt
      notes
      
      candidate {
        fullName
        email
        phone
        visaStatus
        yearsOfExp
      }
      
      job {
        title
        location
        employmentType
        client {
          name
        }
      }
      
      vendor {
        name
        email
      }
      
      rtr {
        id
        status
        validUntil
      }
      
      stageHistory {
        stage
        status
        notes
        changedBy
        createdAt
      }
      
      contract {
        id
        contractType
        startDate
        rates {
          candidateRate
          billRate
          margin
          marginPercent
          payType
        }
      }
    }
    
    pageInfo {
      total
      page
      hasNextPage
    }
  }
}
```

### Get Single Application

```graphql
query GetApplication($id: ID!) {
  application(id: $id) {
    id
    currentStage
    status
    submittedAt
    clientSubmittedAt
    interviewScheduledAt
    offerExtendedAt
    offerAcceptedAt
    startDate
    endDate
    notes
    createdAt
    updatedAt
    
    candidate {
      id
      fullName
      email
      phone
      visaStatus
      yearsOfExp
      candidateSkills {
        skill {
          name
        }
        proficiency
        yearsOfExp
      }
    }
    
    job {
      id
      title
      description
      location
      employmentType
      minSalary
      maxSalary
      client {
        name
        contactName
        contactEmail
      }
      jobSkills {
        skill {
          name
        }
        required
        minYears
      }
    }
    
    vendor {
      id
      name
      email
      phone
      contacts {
        firstName
        lastName
        email
        isPrimary
      }
    }
    
    rtr {
      id
      status
      validFrom
      validUntil
      signedByCandidateAt
      signedByVendorAt
    }
    
    stageHistory {
      id
      stage
      status
      notes
      changedBy
      createdAt
    }
    
    contract {
      id
      contractType
      startDate
      endDate
      rates {
        candidateRate
        billRate
        margin
        marginPercent
        payType
        effectiveFrom
        notes
      }
    }
  }
}

# Variables:
# {
#   "id": "application-uuid-here"
# }
```

---

## 🔨 Mutations

### Create Candidate

```graphql
mutation CreateCandidate {
  createCandidate(
    input: {
      firstName: "John"
      lastName: "Doe"
      email: "john.doe@example.com"
      phone: "+1-555-0123"
      location: "New York, NY"
      linkedIn: "https://linkedin.com/in/johndoe"
      portfolio: "https://johndoe.dev"
      yearsOfExp: 8
      currentRole: "Senior Full Stack Developer"
      visaStatus: US_CITIZEN
    }
  ) {
    id
    fullName
    email
    phone
    visaStatus
    createdAt
  }
}
```

### Add Resume Version

```graphql
mutation AddResume {
  addResumeVersion(
    input: {
      candidateId: "candidate-uuid-here"
      fileUrl: "https://storage.example.com/resumes/john_doe_v3.pdf"
      fileName: "john_doe_resume_v3.pdf"
      summary: "Updated with latest React and Node.js projects"
      setAsActive: true
    }
  ) {
    id
    version
    fileName
    fileUrl
    isActive
    createdAt
  }
}
```

### Create Job

```graphql
mutation CreateJob {
  createJob(
    input: {
      clientId: "client-uuid-here"
      title: "Senior Full Stack Developer"
      description: "We are seeking an experienced Full Stack Developer to join our team..."
      location: "Remote (US)"
      employmentType: FULL_TIME
      minSalary: 120000
      maxSalary: 180000
      billRate: 150
      openings: 2
      priority: HIGH
      startDate: "2024-03-01T00:00:00Z"
      requiredSkills: [
        { skillId: "react-skill-id", required: true, minYears: 5 }
        { skillId: "node-skill-id", required: true, minYears: 4 }
        { skillId: "aws-skill-id", required: false, minYears: 2 }
      ]
    }
  ) {
    id
    title
    status
    location
    minSalary
    maxSalary
    client {
      name
    }
    jobSkills {
      skill {
        name
      }
      required
      minYears
    }
  }
}
```

### Create Application (with Business Rules)

```graphql
mutation CreateApplication {
  createApplication(
    input: {
      candidateId: "candidate-uuid-here"
      jobId: "job-uuid-here"
      vendorId: "vendor-uuid-here"
      notes: "Excellent fit for this position. Strong React and Node.js experience."
    }
  ) {
    id
    currentStage
    status
    submittedAt
    
    candidate {
      fullName
    }
    
    job {
      title
    }
    
    vendor {
      name
    }
    
    rtr {
      id
      status
    }
  }
}

# This will:
# 1. Check for duplicate (same candidate + job + 90-day period)
# 2. Validate RTR requirement (if vendorId provided)
# 3. Create application with SUBMITTED stage
# 4. Create initial stage history entry
```

### Update Application Stage

```graphql
mutation UpdateStage {
  updateApplicationStage(
    input: {
      applicationId: "application-uuid-here"
      stage: INTERVIEWING
      status: ACTIVE
      notes: "Phone screen scheduled for Friday at 2 PM EST"
    }
  ) {
    id
    currentStage
    status
    
    candidate {
      fullName
    }
    
    job {
      title
    }
    
    stageHistory {
      stage
      status
      notes
      changedBy
      createdAt
    }
  }
}
```

### Request RTR

```graphql
mutation RequestRTR {
  requestRTR(
    input: {
      candidateId: "candidate-uuid-here"
      vendorId: "vendor-uuid-here"
      clientId: "client-uuid-here"
      validUntil: "2025-12-31T23:59:59Z"
    }
  ) {
    id
    status
    validFrom
    validUntil
    candidate {
      fullName
    }
  }
}
```

### Confirm RTR

```graphql
mutation ConfirmRTR {
  confirmRTR(
    input: {
      rtrId: "rtr-uuid-here"
      signature: "John Doe - Agreed and Accepted"
      ipAddress: "192.168.1.100"
    }
  ) {
    id
    status
    signedByCandidateAt
    candidateSignature
    candidateIpAddress
    signedByVendorAt
  }
}
```

### Create Contract

```graphql
mutation CreateContract {
  createContract(
    input: {
      applicationId: "application-uuid-here"
      contractType: C2C
      startDate: "2024-03-01T00:00:00Z"
      endDate: "2025-03-01T00:00:00Z"
      candidateRate: 80
      billRate: 120
      payType: HOURLY
    }
  ) {
    id
    contractType
    startDate
    endDate
    
    application {
      candidate {
        fullName
      }
      job {
        title
      }
    }
    
    rates {
      candidateRate
      billRate
      margin
      marginPercent
      payType
      effectiveFrom
    }
  }
}

# Auto-calculates:
# margin = 120 - 80 = 40
# marginPercent = (40 / 120) * 100 = 33.33%
```

---

## 🔍 Other Queries

### Get All Skills

```graphql
query GetSkills {
  skills(search: "java", category: "Programming") {
    id
    name
    category
    description
  }
}
```

### Get Vendors

```graphql
query GetVendors {
  vendors(status: ACTIVE) {
    id
    name
    companyName
    email
    phone
    website
    status
    contacts {
      firstName
      lastName
      email
      phone
      role
      isPrimary
    }
  }
}
```

### Get Clients

```graphql
query GetClients {
  clients(status: ACTIVE) {
    id
    name
    industry
    website
    contactName
    contactEmail
    contactPhone
    status
  }
}
```

### Get RTRs

```graphql
query GetRTRs {
  rtrs(status: SIGNED) {
    id
    status
    validFrom
    validUntil
    signedByCandidateAt
    signedByVendorAt
    candidate {
      fullName
      email
    }
  }
}
```

---

## 🚨 Error Examples

### Duplicate Submission Error

```graphql
mutation {
  createApplication(
    input: {
      candidateId: "same-candidate"
      jobId: "same-job"
      vendorId: "vendor-1"
    }
  ) {
    id
  }
}

# Error Response:
# {
#   "errors": [
#     {
#       "message": "Duplicate submission: John Doe has already been submitted to Senior Developer within the current submission period",
#       "extensions": {
#         "code": "DUPLICATE",
#         "http": {
#           "status": 422
#         }
#       }
#     }
#   ]
# }
```

### RTR Required Error

```graphql
mutation {
  createApplication(
    input: {
      candidateId: "candidate-1"
      jobId: "job-1"
      vendorId: "vendor-1"  # Vendor provided but no valid RTR!
    }
  ) {
    id
  }
}

# Error Response:
# {
#   "errors": [
#     {
#       "message": "A valid, signed RTR (Right to Represent) is required for vendor submissions. The RTR must be signed by both the candidate and vendor, and must be currently valid.",
#       "extensions": {
#         "code": "RTR_REQUIRED",
#         "http": {
#           "status": 422
#         }
#       }
#     }
#   ]
# }
```

### Authorization Error

```graphql
# Without proper Authorization header
query {
  candidates {
    data {
      id
    }
  }
}

# Error Response:
# {
#   "errors": [
#     {
#       "message": "You must be logged in to perform this action",
#       "extensions": {
#         "code": "UNAUTHENTICATED",
#         "http": {
#           "status": 401
#         }
#       }
#     }
#   ]
# }
```

---

## 💡 Tips

1. **Use Variables** for dynamic values instead of hardcoding
2. **Request only needed fields** to improve performance
3. **Use pagination** for large result sets
4. **Check error codes** for proper error handling
5. **Test with different roles** to verify authorization

## 🎮 Try in Playground

1. Start server: `pnpm --filter @narpavi-ats/api dev`
2. Open: http://localhost:4000/graphql
3. Set Authorization header
4. Copy-paste queries from above
5. Modify as needed
6. Click Play button

Happy querying! 🚀
