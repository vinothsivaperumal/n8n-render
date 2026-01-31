import { Context } from '../../types/context';
import { requireAuth } from '../../auth/authorization';
import { NotFoundError } from '../../utils/errors';

export const otherQueries = {
  // Skills
  skills: async (
    _parent: any,
    args: { search?: string; category?: string },
    context: Context
  ) => {
    requireAuth(context);

    const where: any = {};

    if (args.search) {
      where.name = { contains: args.search, mode: 'insensitive' };
    }

    if (args.category) {
      where.category = args.category;
    }

    return context.prisma.skill.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  },

  // Vendors
  vendors: async (_parent: any, args: { status?: string }, context: Context) => {
    requireAuth(context);

    const where: any = { deletedAt: null };

    if (args.status) {
      where.status = args.status;
    }

    return context.prisma.vendor.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        contacts: {
          where: { isPrimary: true },
        },
      },
    });
  },

  vendor: async (_parent: any, args: { id: string }, context: Context) => {
    requireAuth(context);

    const vendor = await context.prisma.vendor.findUnique({
      where: { id: args.id },
      include: {
        contacts: true,
        applications: {
          where: { deletedAt: null },
        },
        documents: true,
      },
    });

    if (!vendor || vendor.deletedAt) {
      throw new NotFoundError('Vendor', args.id);
    }

    return vendor;
  },

  // Clients
  clients: async (_parent: any, args: { status?: string }, context: Context) => {
    requireAuth(context);

    const where: any = { deletedAt: null };

    if (args.status) {
      where.status = args.status;
    }

    return context.prisma.client.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  },

  client: async (_parent: any, args: { id: string }, context: Context) => {
    requireAuth(context);

    const client = await context.prisma.client.findUnique({
      where: { id: args.id },
      include: {
        jobs: {
          where: { deletedAt: null },
        },
        documents: true,
      },
    });

    if (!client || client.deletedAt) {
      throw new NotFoundError('Client', args.id);
    }

    return client;
  },

  // RTRs
  rtrs: async (
    _parent: any,
    args: { candidateId?: string; status?: string },
    context: Context
  ) => {
    requireAuth(context);

    const where: any = { deletedAt: null };

    if (args.candidateId) {
      where.candidateId = args.candidateId;
    }

    if (args.status) {
      where.status = args.status;
    }

    return context.prisma.rightToRepresent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        candidate: true,
      },
    });
  },

  rtr: async (_parent: any, args: { id: string }, context: Context) => {
    requireAuth(context);

    const rtr = await context.prisma.rightToRepresent.findUnique({
      where: { id: args.id },
      include: {
        candidate: true,
      },
    });

    if (!rtr || rtr.deletedAt) {
      throw new NotFoundError('RTR', args.id);
    }

    return rtr;
  },
};
