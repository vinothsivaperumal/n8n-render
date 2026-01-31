import { Context } from '../../types/context';
import { requireRole, UserRole } from '../../auth/authorization';
import { NotFoundError } from '../../utils/errors';
import {
  checkDuplicateApplication,
  validateRTRRequirement,
  calculateDuplicateCheckDate,
} from '../../validation/businessRules';

interface CreateApplicationInput {
  candidateId: string;
  jobId: string;
  vendorId?: string;
  notes?: string;
}

interface UpdateApplicationStageInput {
  applicationId: string;
  stage: string;
  status?: string;
  notes?: string;
}

export const applicationMutations = {
  createApplication: async (
    _parent: any,
    args: { input: CreateApplicationInput },
    context: Context
  ) => {
    // Require ADMIN, RECRUITER, or SALES role
    requireRole(context, [UserRole.ADMIN, UserRole.RECRUITER, UserRole.SALES]);

    const { input } = args;

    // Validate candidate exists
    const candidate = await context.prisma.candidate.findUnique({
      where: { id: input.candidateId },
    });

    if (!candidate || candidate.deletedAt) {
      throw new NotFoundError('Candidate', input.candidateId);
    }

    // Validate job exists
    const job = await context.prisma.job.findUnique({
      where: { id: input.jobId },
    });

    if (!job || job.deletedAt) {
      throw new NotFoundError('Job', input.jobId);
    }

    // Validate vendor exists if provided
    if (input.vendorId) {
      const vendor = await context.prisma.vendor.findUnique({
        where: { id: input.vendorId },
      });

      if (!vendor || vendor.deletedAt) {
        throw new NotFoundError('Vendor', input.vendorId);
      }
    }

    // BUSINESS RULE 1: Check for duplicate submissions
    await checkDuplicateApplication(
      context.prisma,
      input.candidateId,
      input.jobId
    );

    // BUSINESS RULE 2: Validate RTR requirement
    const rtrId = await validateRTRRequirement(
      context.prisma,
      input.candidateId,
      input.vendorId
    );

    // Calculate duplicate check date
    const duplicateCheckDate = calculateDuplicateCheckDate();

    // Create application
    const application = await context.prisma.application.create({
      data: {
        candidateId: input.candidateId,
        jobId: input.jobId,
        vendorId: input.vendorId,
        rtrId,
        currentStage: 'SUBMITTED',
        status: 'ACTIVE',
        notes: input.notes,
        duplicateCheckDate,
      },
      include: {
        candidate: true,
        job: {
          include: { client: true },
        },
        vendor: true,
        rtr: true,
      },
    });

    // Create initial stage history
    await context.prisma.stageHistory.create({
      data: {
        applicationId: application.id,
        stage: 'SUBMITTED',
        status: 'ACTIVE',
        notes: 'Application submitted',
        changedBy: context.user?.email || 'system',
      },
    });

    return application;
  },

  updateApplicationStage: async (
    _parent: any,
    args: { input: UpdateApplicationStageInput },
    context: Context
  ) => {
    // Require ADMIN, RECRUITER, or SALES role
    requireRole(context, [UserRole.ADMIN, UserRole.RECRUITER, UserRole.SALES]);

    const { input } = args;

    // Validate application exists
    const existing = await context.prisma.application.findUnique({
      where: { id: input.applicationId },
    });

    if (!existing || existing.deletedAt) {
      throw new NotFoundError('Application', input.applicationId);
    }

    // Update application
    const application = await context.prisma.application.update({
      where: { id: input.applicationId },
      data: {
        currentStage: input.stage as any,
        status: input.status as any || existing.status,
        notes: input.notes || existing.notes,
      },
      include: {
        candidate: true,
        job: {
          include: { client: true },
        },
        vendor: true,
        rtr: true,
        stageHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Create stage history entry
    await context.prisma.stageHistory.create({
      data: {
        applicationId: input.applicationId,
        stage: input.stage as any,
        status: (input.status as any) || existing.status,
        notes: input.notes,
        changedBy: context.user?.email || 'system',
      },
    });

    return application;
  },
};
