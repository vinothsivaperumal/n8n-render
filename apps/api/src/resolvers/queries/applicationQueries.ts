import { Context } from '../../types/context';
import { requireRole, UserRole } from '../../auth/authorization';
import { NotFoundError } from '../../utils/errors';

interface ApplicationFilterInput {
  candidateId?: string;
  jobId?: string;
  vendorId?: string;
  clientId?: string;
  currentStage?: string[];
  status?: string[];
  dateRange?: {
    from?: Date;
    to?: Date;
  };
}

interface PaginationInput {
  page?: number;
  limit?: number;
}

export const applicationQueries = {
  applications: async (
    _parent: any,
    args: {
      filter?: ApplicationFilterInput;
      pagination?: PaginationInput;
    },
    context: Context
  ) => {
    // Require appropriate role
    requireRole(context, [UserRole.ADMIN, UserRole.RECRUITER, UserRole.SALES]);

    const { filter, pagination } = args;
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      deletedAt: null,
    };

    if (filter) {
      if (filter.candidateId) {
        where.candidateId = filter.candidateId;
      }

      if (filter.jobId) {
        where.jobId = filter.jobId;
      }

      if (filter.vendorId) {
        where.vendorId = filter.vendorId;
      }

      if (filter.clientId) {
        where.job = {
          clientId: filter.clientId,
        };
      }

      if (filter.currentStage && filter.currentStage.length > 0) {
        where.currentStage = { in: filter.currentStage };
      }

      if (filter.status && filter.status.length > 0) {
        where.status = { in: filter.status };
      }

      if (filter.dateRange) {
        if (filter.dateRange.from) {
          where.submittedAt = { ...where.submittedAt, gte: filter.dateRange.from };
        }
        if (filter.dateRange.to) {
          where.submittedAt = { ...where.submittedAt, lte: filter.dateRange.to };
        }
      }
    }

    // Execute queries
    const [data, total] = await Promise.all([
      context.prisma.application.findMany({
        where,
        orderBy: { submittedAt: 'desc' },
        skip,
        take: limit,
        include: {
          candidate: true,
          job: {
            include: { client: true },
          },
          vendor: true,
          rtr: true,
        },
      }),
      context.prisma.application.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pageInfo: {
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        total,
        page,
        limit,
        totalPages,
      },
    };
  },

  application: async (_parent: any, args: { id: string }, context: Context) => {
    // Require appropriate role
    requireRole(context, [UserRole.ADMIN, UserRole.RECRUITER, UserRole.SALES]);

    const application = await context.prisma.application.findUnique({
      where: { id: args.id },
      include: {
        candidate: {
          include: {
            candidateSkills: {
              include: { skill: true },
            },
          },
        },
        job: {
          include: {
            client: true,
            jobSkills: {
              include: { skill: true },
            },
          },
        },
        vendor: true,
        rtr: true,
        stageHistory: {
          orderBy: { createdAt: 'desc' },
        },
        contract: {
          include: {
            rates: true,
          },
        },
      },
    });

    if (!application || application.deletedAt) {
      throw new NotFoundError('Application', args.id);
    }

    return application;
  },
};
