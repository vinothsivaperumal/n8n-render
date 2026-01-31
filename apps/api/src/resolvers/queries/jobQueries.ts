import { Context } from '../../types/context';
import { requireRole, UserRole } from '../../auth/authorization';
import { NotFoundError } from '../../utils/errors';

interface JobFilterInput {
  search?: string;
  vendorId?: string;
  clientId?: string;
  location?: string;
  employmentType?: string[];
  status?: string[];
  priority?: string[];
  minSalary?: number;
  maxSalary?: number;
}

interface JobSortInput {
  field: string;
  order: 'ASC' | 'DESC';
}

interface PaginationInput {
  page?: number;
  limit?: number;
}

export const jobQueries = {
  jobs: async (
    _parent: any,
    args: {
      filter?: JobFilterInput;
      sort?: JobSortInput;
      pagination?: PaginationInput;
    },
    context: Context
  ) => {
    // All authenticated users can view jobs
    const { filter, sort, pagination } = args;
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      deletedAt: null,
    };

    if (filter) {
      if (filter.search) {
        where.OR = [
          { title: { contains: filter.search, mode: 'insensitive' } },
          { description: { contains: filter.search, mode: 'insensitive' } },
        ];
      }

      if (filter.clientId) {
        where.clientId = filter.clientId;
      }

      if (filter.location) {
        where.location = { contains: filter.location, mode: 'insensitive' };
      }

      if (filter.employmentType && filter.employmentType.length > 0) {
        where.employmentType = { in: filter.employmentType };
      }

      if (filter.status && filter.status.length > 0) {
        where.status = { in: filter.status };
      }

      if (filter.priority && filter.priority.length > 0) {
        where.priority = { in: filter.priority };
      }

      if (filter.minSalary !== undefined) {
        where.minSalary = { ...where.minSalary, gte: filter.minSalary };
      }

      if (filter.maxSalary !== undefined) {
        where.maxSalary = { ...where.maxSalary, lte: filter.maxSalary };
      }

      // Filter by vendor (through applications)
      if (filter.vendorId) {
        where.applications = {
          some: {
            vendorId: filter.vendorId,
          },
        };
      }
    }

    // Build order by
    const orderBy: any = {};
    if (sort) {
      const field = sort.field || 'createdAt';
      orderBy[field] = sort.order.toLowerCase();
    } else {
      orderBy.createdAt = 'desc';
    }

    // Execute queries
    const [data, total] = await Promise.all([
      context.prisma.job.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          client: true,
          jobSkills: {
            include: { skill: true },
          },
        },
      }),
      context.prisma.job.count({ where }),
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

  job: async (_parent: any, args: { id: string }, context: Context) => {
    const job = await context.prisma.job.findUnique({
      where: { id: args.id },
      include: {
        client: true,
        jobSkills: {
          include: { skill: true },
        },
        applications: {
          where: { deletedAt: null },
          include: {
            candidate: true,
            vendor: true,
          },
        },
      },
    });

    if (!job || job.deletedAt) {
      throw new NotFoundError('Job', args.id);
    }

    return job;
  },
};
