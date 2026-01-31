import { Context } from '../../types/context';
import { requireRole, UserRole } from '../../auth/authorization';
import { NotFoundError } from '../../utils/errors';

interface CreateJobInput {
  clientId: string;
  title: string;
  description: string;
  location: string;
  employmentType: string;
  duration?: string;
  minSalary?: number;
  maxSalary?: number;
  billRate?: number;
  openings?: number;
  priority?: string;
  startDate?: Date;
  endDate?: Date;
  requiredSkills?: Array<{
    skillId: string;
    required?: boolean;
    minYears?: number;
  }>;
}

interface UpdateJobInput {
  title?: string;
  description?: string;
  location?: string;
  employmentType?: string;
  duration?: string;
  minSalary?: number;
  maxSalary?: number;
  billRate?: number;
  status?: string;
  openings?: number;
  priority?: string;
  startDate?: Date;
  endDate?: Date;
}

export const jobMutations = {
  createJob: async (
    _parent: any,
    args: { input: CreateJobInput },
    context: Context
  ) => {
    // Require ADMIN or SALES role
    requireRole(context, [UserRole.ADMIN, UserRole.SALES]);

    const { input } = args;
    const { requiredSkills, ...jobData } = input;

    // Check if client exists
    const client = await context.prisma.client.findUnique({
      where: { id: input.clientId },
    });

    if (!client || client.deletedAt) {
      throw new NotFoundError('Client', input.clientId);
    }

    // Create job with skills
    const job = await context.prisma.job.create({
      data: {
        ...jobData,
        openings: jobData.openings || 1,
        priority: (jobData.priority as any) || 'MEDIUM',
        status: 'OPEN',
        jobSkills: requiredSkills
          ? {
              create: requiredSkills.map((skill) => ({
                skillId: skill.skillId,
                required: skill.required !== false,
                minYears: skill.minYears,
              })),
            }
          : undefined,
      } as any,
      include: {
        client: true,
        jobSkills: {
          include: { skill: true },
        },
      },
    });

    return job;
  },

  updateJob: async (
    _parent: any,
    args: { id: string; input: UpdateJobInput },
    context: Context
  ) => {
    // Require ADMIN or SALES role
    requireRole(context, [UserRole.ADMIN, UserRole.SALES]);

    const { id, input } = args;

    // Check if job exists
    const existing = await context.prisma.job.findUnique({
      where: { id },
    });

    if (!existing || existing.deletedAt) {
      throw new NotFoundError('Job', id);
    }

    // Update job
    const job = await context.prisma.job.update({
      where: { id },
      data: input as any,
      include: {
        client: true,
        jobSkills: {
          include: { skill: true },
        },
      },
    });

    return job;
  },
};
