import { Context } from '../../types/context';
import { requireRole, UserRole } from '../../auth/authorization';
import { NotFoundError } from '../../utils/errors';

interface CandidateFilterInput {
  search?: string;
  visaStatus?: string[];
  location?: string;
  skills?: string[];
  minYearsOfExp?: number;
  maxYearsOfExp?: number;
}

interface CandidateSortInput {
  field: string;
  order: 'ASC' | 'DESC';
}

interface PaginationInput {
  page?: number;
  limit?: number;
}

export const candidateQueries = {
  candidates: async (
    _parent: any,
    args: {
      filter?: CandidateFilterInput;
      sort?: CandidateSortInput;
      pagination?: PaginationInput;
    },
    context: Context
  ) => {
    // Require ADMIN or RECRUITER role
    requireRole(context, [UserRole.ADMIN, UserRole.RECRUITER]);

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
          { firstName: { contains: filter.search, mode: 'insensitive' } },
          { lastName: { contains: filter.search, mode: 'insensitive' } },
          { email: { contains: filter.search, mode: 'insensitive' } },
        ];
      }

      if (filter.visaStatus && filter.visaStatus.length > 0) {
        where.visaStatus = { in: filter.visaStatus };
      }

      if (filter.location) {
        where.location = { contains: filter.location, mode: 'insensitive' };
      }

      if (filter.minYearsOfExp !== undefined) {
        where.yearsOfExp = { ...where.yearsOfExp, gte: filter.minYearsOfExp };
      }

      if (filter.maxYearsOfExp !== undefined) {
        where.yearsOfExp = { ...where.yearsOfExp, lte: filter.maxYearsOfExp };
      }

      if (filter.skills && filter.skills.length > 0) {
        where.candidateSkills = {
          some: {
            skill: {
              id: { in: filter.skills },
            },
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
      context.prisma.candidate.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          resumeVersions: true,
          candidateSkills: {
            include: { skill: true },
          },
        },
      }),
      context.prisma.candidate.count({ where }),
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

  candidate: async (_parent: any, args: { id: string }, context: Context) => {
    // Require ADMIN or RECRUITER role
    requireRole(context, [UserRole.ADMIN, UserRole.RECRUITER]);

    const candidate = await context.prisma.candidate.findUnique({
      where: { id: args.id },
      include: {
        resumeVersions: true,
        candidateSkills: {
          include: { skill: true },
        },
        applications: {
          include: {
            job: { include: { client: true } },
            vendor: true,
          },
        },
        rtrs: true,
        documents: true,
      },
    });

    if (!candidate || candidate.deletedAt) {
      throw new NotFoundError('Candidate', args.id);
    }

    return candidate;
  },
};
