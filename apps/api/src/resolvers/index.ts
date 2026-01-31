import { Context } from '../index';

export const resolvers = {
  Query: {
    users: async (_parent: any, _args: any, context: Context) => {
      return context.prisma.user.findMany({
        include: { applications: true },
      });
    },
    user: async (_parent: any, args: { id: string }, context: Context) => {
      return context.prisma.user.findUnique({
        where: { id: args.id },
        include: { applications: true },
      });
    },
    jobs: async (_parent: any, args: { status?: string }, context: Context) => {
      return context.prisma.job.findMany({
        where: args.status ? { status: args.status as any } : undefined,
        include: { applications: true },
      });
    },
    job: async (_parent: any, args: { id: string }, context: Context) => {
      return context.prisma.job.findUnique({
        where: { id: args.id },
        include: { applications: true },
      });
    },
    applications: async (_parent: any, _args: any, context: Context) => {
      return context.prisma.application.findMany({
        include: { user: true, job: true },
      });
    },
    application: async (_parent: any, args: { id: string }, context: Context) => {
      return context.prisma.application.findUnique({
        where: { id: args.id },
        include: { user: true, job: true },
      });
    },
  },
  Mutation: {
    createUser: async (
      _parent: any,
      args: { email: string; name?: string; role?: string },
      context: Context
    ) => {
      return context.prisma.user.create({
        data: {
          email: args.email,
          name: args.name,
          role: args.role as any,
        },
      });
    },
    updateUser: async (
      _parent: any,
      args: { id: string; name?: string; role?: string },
      context: Context
    ) => {
      return context.prisma.user.update({
        where: { id: args.id },
        data: {
          name: args.name,
          role: args.role as any,
        },
      });
    },
    deleteUser: async (_parent: any, args: { id: string }, context: Context) => {
      await context.prisma.user.delete({
        where: { id: args.id },
      });
      return true;
    },
    createJob: async (
      _parent: any,
      args: {
        title: string;
        description: string;
        department: string;
        location: string;
        type: string;
      },
      context: Context
    ) => {
      return context.prisma.job.create({
        data: {
          title: args.title,
          description: args.description,
          department: args.department,
          location: args.location,
          type: args.type as any,
        },
      });
    },
    updateJob: async (_parent: any, args: any, context: Context) => {
      const { id, ...data } = args;
      return context.prisma.job.update({
        where: { id },
        data,
      });
    },
    deleteJob: async (_parent: any, args: { id: string }, context: Context) => {
      await context.prisma.job.delete({
        where: { id: args.id },
      });
      return true;
    },
    createApplication: async (_parent: any, args: any, context: Context) => {
      return context.prisma.application.create({
        data: {
          userId: args.userId,
          jobId: args.jobId,
          coverLetter: args.coverLetter,
          resumeUrl: args.resumeUrl,
        },
        include: { user: true, job: true },
      });
    },
    updateApplicationStatus: async (
      _parent: any,
      args: { id: string; status: string },
      context: Context
    ) => {
      return context.prisma.application.update({
        where: { id: args.id },
        data: { status: args.status as any },
        include: { user: true, job: true },
      });
    },
    deleteApplication: async (_parent: any, args: { id: string }, context: Context) => {
      await context.prisma.application.delete({
        where: { id: args.id },
      });
      return true;
    },
  },
  User: {
    applications: async (parent: any, _args: any, context: Context) => {
      return context.prisma.application.findMany({
        where: { userId: parent.id },
        include: { job: true },
      });
    },
  },
  Job: {
    applications: async (parent: any, _args: any, context: Context) => {
      return context.prisma.application.findMany({
        where: { jobId: parent.id },
        include: { user: true },
      });
    },
  },
  Application: {
    user: async (parent: any, _args: any, context: Context) => {
      return context.prisma.user.findUnique({
        where: { id: parent.userId },
      });
    },
    job: async (parent: any, _args: any, context: Context) => {
      return context.prisma.job.findUnique({
        where: { id: parent.jobId },
      });
    },
  },
};
