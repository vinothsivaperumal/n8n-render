import { gql } from '@apollo/client';

export const GET_JOBS = gql`
  query GetJobs($status: JobStatus) {
    jobs(status: $status) {
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
`;

export const GET_JOB = gql`
  query GetJob($id: ID!) {
    job(id: $id) {
      id
      title
      description
      department
      location
      type
      status
      createdAt
      applications {
        id
        status
        user {
          id
          name
          email
        }
      }
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
      name
      role
      createdAt
    }
  }
`;

export const CREATE_JOB = gql`
  mutation CreateJob(
    $title: String!
    $description: String!
    $department: String!
    $location: String!
    $type: JobType!
  ) {
    createJob(
      title: $title
      description: $description
      department: $department
      location: $location
      type: $type
    ) {
      id
      title
      description
      department
      location
      type
      status
    }
  }
`;

export const CREATE_APPLICATION = gql`
  mutation CreateApplication(
    $userId: String!
    $jobId: String!
    $coverLetter: String
    $resumeUrl: String
  ) {
    createApplication(
      userId: $userId
      jobId: $jobId
      coverLetter: $coverLetter
      resumeUrl: $resumeUrl
    ) {
      id
      status
      createdAt
    }
  }
`;
