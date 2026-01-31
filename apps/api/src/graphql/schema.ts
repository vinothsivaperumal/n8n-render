import gql from 'graphql-tag';

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String
    role: Role!
    createdAt: String!
    updatedAt: String!
    applications: [Application!]!
  }

  type Job {
    id: ID!
    title: String!
    description: String!
    department: String!
    location: String!
    type: JobType!
    status: JobStatus!
    createdAt: String!
    updatedAt: String!
    applications: [Application!]!
  }

  type Application {
    id: ID!
    userId: String!
    jobId: String!
    status: ApplicationStatus!
    coverLetter: String
    resumeUrl: String
    createdAt: String!
    updatedAt: String!
    user: User!
    job: Job!
  }

  enum Role {
    USER
    ADMIN
    RECRUITER
  }

  enum JobType {
    FULL_TIME
    PART_TIME
    CONTRACT
    INTERNSHIP
  }

  enum JobStatus {
    OPEN
    CLOSED
    DRAFT
  }

  enum ApplicationStatus {
    PENDING
    REVIEWING
    INTERVIEW
    REJECTED
    ACCEPTED
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    jobs(status: JobStatus): [Job!]!
    job(id: ID!): Job
    applications: [Application!]!
    application(id: ID!): Application
  }

  type Mutation {
    createUser(email: String!, name: String, role: Role): User!
    updateUser(id: ID!, name: String, role: Role): User!
    deleteUser(id: ID!): Boolean!

    createJob(
      title: String!
      description: String!
      department: String!
      location: String!
      type: JobType!
    ): Job!
    updateJob(
      id: ID!
      title: String
      description: String
      department: String
      location: String
      type: JobType
      status: JobStatus
    ): Job!
    deleteJob(id: ID!): Boolean!

    createApplication(
      userId: String!
      jobId: String!
      coverLetter: String
      resumeUrl: String
    ): Application!
    updateApplicationStatus(id: ID!, status: ApplicationStatus!): Application!
    deleteApplication(id: ID!): Boolean!
  }
`;
