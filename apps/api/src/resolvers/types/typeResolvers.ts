import { Context } from '../../types/context';

export const typeResolvers = {
  Candidate: {
    fullName: (parent: any) => `${parent.firstName} ${parent.lastName}`,
    
    resumeVersions: async (parent: any, _args: any, context: Context) => {
      return context.prisma.resumeVersion.findMany({
        where: { candidateId: parent.id },
        orderBy: { version: 'desc' },
      });
    },
    
    candidateSkills: async (parent: any, _args: any, context: Context) => {
      return context.prisma.candidateSkill.findMany({
        where: { candidateId: parent.id },
        include: { skill: true },
      });
    },
    
    applications: async (parent: any, _args: any, context: Context) => {
      return context.prisma.application.findMany({
        where: {
          candidateId: parent.id,
          deletedAt: null,
        },
        orderBy: { submittedAt: 'desc' },
      });
    },
    
    rtrs: async (parent: any, _args: any, context: Context) => {
      return context.prisma.rightToRepresent.findMany({
        where: {
          candidateId: parent.id,
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      });
    },
    
    documents: async (parent: any, _args: any, context: Context) => {
      return context.prisma.document.findMany({
        where: {
          candidateId: parent.id,
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      });
    },
  },

  Job: {
    client: async (parent: any, _args: any, context: Context) => {
      return context.prisma.client.findUnique({
        where: { id: parent.clientId },
      });
    },
    
    jobSkills: async (parent: any, _args: any, context: Context) => {
      return context.prisma.jobSkill.findMany({
        where: { jobId: parent.id },
        include: { skill: true },
      });
    },
    
    applications: async (parent: any, _args: any, context: Context) => {
      return context.prisma.application.findMany({
        where: {
          jobId: parent.id,
          deletedAt: null,
        },
        orderBy: { submittedAt: 'desc' },
      });
    },
  },

  Application: {
    candidate: async (parent: any, _args: any, context: Context) => {
      return context.prisma.candidate.findUnique({
        where: { id: parent.candidateId },
      });
    },
    
    job: async (parent: any, _args: any, context: Context) => {
      return context.prisma.job.findUnique({
        where: { id: parent.jobId },
        include: { client: true },
      });
    },
    
    vendor: async (parent: any, _args: any, context: Context) => {
      if (!parent.vendorId) return null;
      return context.prisma.vendor.findUnique({
        where: { id: parent.vendorId },
      });
    },
    
    rtr: async (parent: any, _args: any, context: Context) => {
      if (!parent.rtrId) return null;
      return context.prisma.rightToRepresent.findUnique({
        where: { id: parent.rtrId },
      });
    },
    
    stageHistory: async (parent: any, _args: any, context: Context) => {
      return context.prisma.stageHistory.findMany({
        where: { applicationId: parent.id },
        orderBy: { createdAt: 'desc' },
      });
    },
    
    contract: async (parent: any, _args: any, context: Context) => {
      return context.prisma.contract.findUnique({
        where: { applicationId: parent.id },
        include: { rates: true },
      });
    },
  },

  Vendor: {
    contacts: async (parent: any, _args: any, context: Context) => {
      return context.prisma.vendorContact.findMany({
        where: {
          vendorId: parent.id,
          deletedAt: null,
        },
        orderBy: { isPrimary: 'desc' },
      });
    },
    
    applications: async (parent: any, _args: any, context: Context) => {
      return context.prisma.application.findMany({
        where: {
          vendorId: parent.id,
          deletedAt: null,
        },
        orderBy: { submittedAt: 'desc' },
      });
    },
    
    documents: async (parent: any, _args: any, context: Context) => {
      return context.prisma.document.findMany({
        where: {
          vendorId: parent.id,
          deletedAt: null,
        },
      });
    },
  },

  Client: {
    jobs: async (parent: any, _args: any, context: Context) => {
      return context.prisma.job.findMany({
        where: {
          clientId: parent.id,
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      });
    },
    
    documents: async (parent: any, _args: any, context: Context) => {
      return context.prisma.document.findMany({
        where: {
          clientId: parent.id,
          deletedAt: null,
        },
      });
    },
  },

  Contract: {
    application: async (parent: any, _args: any, context: Context) => {
      return context.prisma.application.findUnique({
        where: { id: parent.applicationId },
      });
    },
    
    candidate: async (parent: any, _args: any, context: Context) => {
      return context.prisma.candidate.findUnique({
        where: { id: parent.candidateId },
      });
    },
    
    vendor: async (parent: any, _args: any, context: Context) => {
      if (!parent.vendorId) return null;
      return context.prisma.vendor.findUnique({
        where: { id: parent.vendorId },
      });
    },
    
    rates: async (parent: any, _args: any, context: Context) => {
      return context.prisma.rate.findMany({
        where: { contractId: parent.id },
        orderBy: { effectiveFrom: 'desc' },
      });
    },
  },

  RightToRepresent: {
    candidate: async (parent: any, _args: any, context: Context) => {
      return context.prisma.candidate.findUnique({
        where: { id: parent.candidateId },
      });
    },
  },
};
