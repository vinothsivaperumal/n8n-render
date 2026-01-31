import gql from 'graphql-tag';

export const typeDefs = gql`
  # ========================================
  # SCALARS & DIRECTIVES
  # ========================================

  scalar DateTime
  scalar JSON

  # ========================================
  # ENUMS
  # ========================================

  enum UserRole {
    ADMIN
    RECRUITER
    SALES
    FINANCE
  }

  enum VisaStatus {
    US_CITIZEN
    GREEN_CARD
    H1B
    H4_EAD
    L2_EAD
    OPT
    CPT
    TN
    GC_EAD
    OTHER
  }

  enum SkillLevel {
    BEGINNER
    INTERMEDIATE
    ADVANCED
    EXPERT
  }

  enum VendorStatus {
    ACTIVE
    INACTIVE
    SUSPENDED
    PENDING_APPROVAL
  }

  enum ClientStatus {
    ACTIVE
    INACTIVE
    PROSPECT
    SUSPENDED
  }

  enum EmploymentType {
    FULL_TIME
    PART_TIME
    CONTRACT
    CONTRACT_TO_HIRE
    TEMPORARY
    INTERNSHIP
  }

  enum JobStatus {
    DRAFT
    OPEN
    ON_HOLD
    FILLED
    CLOSED
    CANCELLED
  }

  enum JobPriority {
    LOW
    MEDIUM
    HIGH
    URGENT
  }

  enum ApplicationStage {
    SUBMITTED
    SCREENING
    CLIENT_SUBMITTED
    INTERVIEW_SCHEDULED
    INTERVIEWING
    TECHNICAL_ROUND
    FINAL_ROUND
    OFFER_EXTENDED
    OFFER_ACCEPTED
    OFFER_DECLINED
    ONBOARDING
    PLACED
    REJECTED
    WITHDRAWN
  }

  enum ApplicationStatus {
    ACTIVE
    ON_HOLD
    CLOSED
    WITHDRAWN
  }

  enum RTRStatus {
    PENDING
    SIGNED
    EXPIRED
    REVOKED
  }

  enum ContractType {
    C2C
    W2
    CORP_TO_CORP
    INDEPENDENT_CONTRACTOR
  }

  enum PayType {
    HOURLY
    DAILY
    WEEKLY
    MONTHLY
    ANNUAL
  }

  enum DocumentType {
    RESUME
    VISA_DOCUMENT
    ID_PROOF
    PASSPORT
    DRIVERS_LICENSE
    RTR_SIGNED
    MSA
    NDA
    SOW
    OFFER_LETTER
    CONTRACT
    BACKGROUND_CHECK
    DRUG_TEST
    CERTIFICATE
    OTHER
  }

  enum SortOrder {
    ASC
    DESC
  }

  # ========================================
  # PAGINATION & COMMON TYPES
  # ========================================

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  input PaginationInput {
    page: Int = 1
    limit: Int = 20
  }

  input DateRangeInput {
    from: DateTime
    to: DateTime
  }

  # ========================================
  # CANDIDATE TYPES
  # ========================================

  type Candidate {
    id: ID!
    firstName: String!
    lastName: String!
    fullName: String!
    email: String!
    phone: String
    location: String
    linkedIn: String
    portfolio: String
    yearsOfExp: Int
    currentRole: String
    visaStatus: VisaStatus
    createdAt: DateTime!
    updatedAt: DateTime!
    deletedAt: DateTime
    
    resumeVersions: [ResumeVersion!]!
    candidateSkills: [CandidateSkill!]!
    applications: [Application!]!
    rtrs: [RightToRepresent!]!
    documents: [Document!]!
  }

  type CandidatePage {
    data: [Candidate!]!
    pageInfo: PageInfo!
  }

  type ResumeVersion {
    id: ID!
    candidateId: String!
    version: Int!
    fileUrl: String!
    fileName: String!
    summary: String
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    candidate: Candidate!
  }

  type Skill {
    id: ID!
    name: String!
    category: String
    description: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type CandidateSkill {
    id: ID!
    candidateId: String!
    skillId: String!
    yearsOfExp: Float
    proficiency: SkillLevel!
    createdAt: DateTime!
    candidate: Candidate!
    skill: Skill!
  }

  # ========================================
  # VENDOR TYPES
  # ========================================

  type Vendor {
    id: ID!
    name: String!
    companyName: String!
    email: String!
    phone: String
    website: String
    address: String
    taxId: String
    status: VendorStatus!
    createdAt: DateTime!
    updatedAt: DateTime!
    deletedAt: DateTime
    
    contacts: [VendorContact!]!
    applications: [Application!]!
    documents: [Document!]!
  }

  type VendorContact {
    id: ID!
    vendorId: String!
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    role: String
    isPrimary: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    vendor: Vendor!
  }

  # ========================================
  # CLIENT & JOB TYPES
  # ========================================

  type Client {
    id: ID!
    name: String!
    industry: String
    website: String
    address: String
    contactName: String
    contactEmail: String
    contactPhone: String
    status: ClientStatus!
    createdAt: DateTime!
    updatedAt: DateTime!
    deletedAt: DateTime
    
    jobs: [Job!]!
    documents: [Document!]!
  }

  type Job {
    id: ID!
    clientId: String!
    title: String!
    description: String!
    location: String!
    employmentType: EmploymentType!
    duration: String
    minSalary: Float
    maxSalary: Float
    billRate: Float
    status: JobStatus!
    openings: Int!
    priority: JobPriority!
    startDate: DateTime
    endDate: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    deletedAt: DateTime
    
    client: Client!
    jobSkills: [JobSkill!]!
    applications: [Application!]!
  }

  type JobPage {
    data: [Job!]!
    pageInfo: PageInfo!
  }

  type JobSkill {
    id: ID!
    jobId: String!
    skillId: String!
    required: Boolean!
    minYears: Float
    createdAt: DateTime!
    job: Job!
    skill: Skill!
  }

  # ========================================
  # APPLICATION TYPES
  # ========================================

  type Application {
    id: ID!
    candidateId: String!
    jobId: String!
    vendorId: String
    rtrId: String
    currentStage: ApplicationStage!
    status: ApplicationStatus!
    submittedAt: DateTime!
    clientSubmittedAt: DateTime
    interviewScheduledAt: DateTime
    offerExtendedAt: DateTime
    offerAcceptedAt: DateTime
    startDate: DateTime
    endDate: DateTime
    notes: String
    createdAt: DateTime!
    updatedAt: DateTime!
    deletedAt: DateTime
    
    candidate: Candidate!
    job: Job!
    vendor: Vendor
    rtr: RightToRepresent
    stageHistory: [StageHistory!]!
    contract: Contract
  }

  type ApplicationPage {
    data: [Application!]!
    pageInfo: PageInfo!
  }

  type StageHistory {
    id: ID!
    applicationId: String!
    stage: ApplicationStage!
    status: ApplicationStatus!
    notes: String
    changedBy: String
    createdAt: DateTime!
    application: Application!
  }

  # ========================================
  # RTR TYPES
  # ========================================

  type RightToRepresent {
    id: ID!
    candidateId: String!
    vendorId: String
    clientId: String
    validFrom: DateTime!
    validUntil: DateTime!
    signedByCandidateAt: DateTime
    candidateSignature: String
    candidateIpAddress: String
    signedByVendorAt: DateTime
    vendorSignature: String
    vendorIpAddress: String
    status: RTRStatus!
    documentUrl: String
    createdAt: DateTime!
    updatedAt: DateTime!
    deletedAt: DateTime
    
    candidate: Candidate!
  }

  # ========================================
  # CONTRACT TYPES
  # ========================================

  type Contract {
    id: ID!
    applicationId: String!
    candidateId: String!
    vendorId: String
    contractType: ContractType!
    startDate: DateTime!
    endDate: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    deletedAt: DateTime
    
    application: Application!
    candidate: Candidate!
    vendor: Vendor
    rates: [Rate!]!
  }

  type Rate {
    id: ID!
    contractId: String!
    candidateRate: Float!
    billRate: Float!
    payType: PayType!
    margin: Float
    marginPercent: Float
    effectiveFrom: DateTime!
    effectiveTo: DateTime
    notes: String
    createdAt: DateTime!
    updatedAt: DateTime!
    contract: Contract!
  }

  # ========================================
  # DOCUMENT TYPES
  # ========================================

  type Document {
    id: ID!
    candidateId: String
    vendorId: String
    clientId: String
    documentType: DocumentType!
    fileName: String!
    fileUrl: String!
    fileSize: Int
    mimeType: String
    description: String
    expiryDate: DateTime
    uploadedBy: String
    createdAt: DateTime!
    updatedAt: DateTime!
    deletedAt: DateTime
  }

  # ========================================
  # DASHBOARD TYPES
  # ========================================

  type DashboardMetrics {
    totalCandidates: Int!
    totalJobs: Int!
    totalApplications: Int!
    applicationsByStage: [StageCount!]!
    placementRate: Float!
    averageTimeToPlacement: Float
    topVendors: [VendorMetric!]!
    recentActivity: [ActivityItem!]!
  }

  type StageCount {
    stage: ApplicationStage!
    count: Int!
  }

  type VendorMetric {
    vendor: Vendor!
    submissionCount: Int!
    placementCount: Int!
    placementRate: Float!
  }

  type ActivityItem {
    id: ID!
    type: String!
    description: String!
    timestamp: DateTime!
    metadata: JSON
  }

  # ========================================
  # INPUT TYPES
  # ========================================

  input CandidateFilterInput {
    search: String
    visaStatus: [VisaStatus!]
    location: String
    skills: [String!]
    minYearsOfExp: Int
    maxYearsOfExp: Int
  }

  input CandidateSortInput {
    field: String!
    order: SortOrder!
  }

  input JobFilterInput {
    search: String
    vendorId: String
    clientId: String
    location: String
    employmentType: [EmploymentType!]
    status: [JobStatus!]
    priority: [JobPriority!]
    minSalary: Float
    maxSalary: Float
  }

  input JobSortInput {
    field: String!
    order: SortOrder!
  }

  input ApplicationFilterInput {
    candidateId: String
    jobId: String
    vendorId: String
    clientId: String
    currentStage: [ApplicationStage!]
    status: [ApplicationStatus!]
    dateRange: DateRangeInput
  }

  input CreateCandidateInput {
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    location: String
    linkedIn: String
    portfolio: String
    yearsOfExp: Int
    currentRole: String
    visaStatus: VisaStatus
  }

  input UpdateCandidateInput {
    firstName: String
    lastName: String
    email: String
    phone: String
    location: String
    linkedIn: String
    portfolio: String
    yearsOfExp: Int
    currentRole: String
    visaStatus: VisaStatus
  }

  input AddResumeVersionInput {
    candidateId: String!
    fileUrl: String!
    fileName: String!
    summary: String
    setAsActive: Boolean
  }

  input CreateJobInput {
    clientId: String!
    title: String!
    description: String!
    location: String!
    employmentType: EmploymentType!
    duration: String
    minSalary: Float
    maxSalary: Float
    billRate: Float
    openings: Int
    priority: JobPriority
    startDate: DateTime
    endDate: DateTime
    requiredSkills: [RequiredSkillInput!]
  }

  input RequiredSkillInput {
    skillId: String!
    required: Boolean
    minYears: Float
  }

  input UpdateJobInput {
    title: String
    description: String
    location: String
    employmentType: EmploymentType
    duration: String
    minSalary: Float
    maxSalary: Float
    billRate: Float
    status: JobStatus
    openings: Int
    priority: JobPriority
    startDate: DateTime
    endDate: DateTime
  }

  input CreateApplicationInput {
    candidateId: String!
    jobId: String!
    vendorId: String
    notes: String
  }

  input UpdateApplicationStageInput {
    applicationId: String!
    stage: ApplicationStage!
    status: ApplicationStatus
    notes: String
  }

  input RequestRTRInput {
    candidateId: String!
    vendorId: String
    clientId: String
    validUntil: DateTime!
  }

  input ConfirmRTRInput {
    rtrId: String!
    signature: String!
    ipAddress: String
  }

  input CreateContractInput {
    applicationId: String!
    contractType: ContractType!
    startDate: DateTime!
    endDate: DateTime
    candidateRate: Float!
    billRate: Float!
    payType: PayType!
  }

  input UpdateContractInput {
    startDate: DateTime
    endDate: DateTime
  }

  # ========================================
  # QUERIES
  # ========================================

  type Query {
    # Candidates
    candidates(
      filter: CandidateFilterInput
      sort: CandidateSortInput
      pagination: PaginationInput
    ): CandidatePage!
    
    candidate(id: ID!): Candidate
    
    # Jobs
    jobs(
      filter: JobFilterInput
      sort: JobSortInput
      pagination: PaginationInput
    ): JobPage!
    
    job(id: ID!): Job
    
    # Applications
    applications(
      filter: ApplicationFilterInput
      pagination: PaginationInput
    ): ApplicationPage!
    
    application(id: ID!): Application
    
    # Skills
    skills(search: String, category: String): [Skill!]!
    
    # Vendors
    vendors(status: VendorStatus): [Vendor!]!
    vendor(id: ID!): Vendor
    
    # Clients
    clients(status: ClientStatus): [Client!]!
    client(id: ID!): Client
    
    # RTRs
    rtrs(candidateId: String, status: RTRStatus): [RightToRepresent!]!
    rtr(id: ID!): RightToRepresent
    
    # Dashboard
    dashboardMetrics(dateRange: DateRangeInput): DashboardMetrics!
  }

  # ========================================
  # MUTATIONS
  # ========================================

  type Mutation {
    # Candidate Mutations
    createCandidate(input: CreateCandidateInput!): Candidate!
    updateCandidate(id: ID!, input: UpdateCandidateInput!): Candidate!
    addResumeVersion(input: AddResumeVersionInput!): ResumeVersion!
    
    # Job Mutations
    createJob(input: CreateJobInput!): Job!
    updateJob(id: ID!, input: UpdateJobInput!): Job!
    
    # Application Mutations
    createApplication(input: CreateApplicationInput!): Application!
    updateApplicationStage(input: UpdateApplicationStageInput!): Application!
    
    # RTR Mutations
    requestRTR(input: RequestRTRInput!): RightToRepresent!
    confirmRTR(input: ConfirmRTRInput!): RightToRepresent!
    
    # Contract Mutations
    createContract(input: CreateContractInput!): Contract!
    updateContract(id: ID!, input: UpdateContractInput!): Contract!
  }
`;
