import { Context } from '../../types/context';
import { requireRole, UserRole } from '../../auth/authorization';
import { NotFoundError, ValidationError } from '../../utils/errors';
import { validateEmail, validatePhone } from '../../validation/businessRules';

interface CreateCandidateInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedIn?: string;
  portfolio?: string;
  yearsOfExp?: number;
  currentRole?: string;
  visaStatus?: string;
}

interface UpdateCandidateInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedIn?: string;
  portfolio?: string;
  yearsOfExp?: number;
  currentRole?: string;
  visaStatus?: string;
}

interface AddResumeVersionInput {
  candidateId: string;
  fileUrl: string;
  fileName: string;
  summary?: string;
  setAsActive?: boolean;
}

export const candidateMutations = {
  createCandidate: async (
    _parent: any,
    args: { input: CreateCandidateInput },
    context: Context
  ) => {
    // Require ADMIN or RECRUITER role
    requireRole(context, [UserRole.ADMIN, UserRole.RECRUITER]);

    const { input } = args;

    // Validate email
    validateEmail(input.email);

    // Validate phone if provided
    if (input.phone) {
      validatePhone(input.phone);
    }

    // Check for existing candidate with same email
    const existing = await context.prisma.candidate.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new ValidationError('A candidate with this email already exists', 'email');
    }

    // Create candidate
    const candidate = await context.prisma.candidate.create({
      data: input as any,
      include: {
        resumeVersions: true,
        candidateSkills: {
          include: { skill: true },
        },
      },
    });

    return candidate;
  },

  updateCandidate: async (
    _parent: any,
    args: { id: string; input: UpdateCandidateInput },
    context: Context
  ) => {
    // Require ADMIN or RECRUITER role
    requireRole(context, [UserRole.ADMIN, UserRole.RECRUITER]);

    const { id, input } = args;

    // Check if candidate exists
    const existing = await context.prisma.candidate.findUnique({
      where: { id },
    });

    if (!existing || existing.deletedAt) {
      throw new NotFoundError('Candidate', id);
    }

    // Validate email if being updated
    if (input.email) {
      validateEmail(input.email);

      // Check for email conflicts
      const emailConflict = await context.prisma.candidate.findFirst({
        where: {
          email: input.email,
          id: { not: id },
        },
      });

      if (emailConflict) {
        throw new ValidationError('A candidate with this email already exists', 'email');
      }
    }

    // Validate phone if provided
    if (input.phone) {
      validatePhone(input.phone);
    }

    // Update candidate
    const candidate = await context.prisma.candidate.update({
      where: { id },
      data: input as any,
      include: {
        resumeVersions: true,
        candidateSkills: {
          include: { skill: true },
        },
      },
    });

    return candidate;
  },

  addResumeVersion: async (
    _parent: any,
    args: { input: AddResumeVersionInput },
    context: Context
  ) => {
    // Require ADMIN or RECRUITER role
    requireRole(context, [UserRole.ADMIN, UserRole.RECRUITER]);

    const { input } = args;

    // Check if candidate exists
    const candidate = await context.prisma.candidate.findUnique({
      where: { id: input.candidateId },
      include: {
        resumeVersions: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });

    if (!candidate || candidate.deletedAt) {
      throw new NotFoundError('Candidate', input.candidateId);
    }

    // Determine next version number
    const nextVersion = candidate.resumeVersions.length > 0
      ? candidate.resumeVersions[0].version + 1
      : 1;

    // If setting as active, deactivate all other versions
    if (input.setAsActive) {
      await context.prisma.resumeVersion.updateMany({
        where: {
          candidateId: input.candidateId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });
    }

    // Create resume version
    const resumeVersion = await context.prisma.resumeVersion.create({
      data: {
        candidateId: input.candidateId,
        version: nextVersion,
        fileUrl: input.fileUrl,
        fileName: input.fileName,
        summary: input.summary,
        isActive: input.setAsActive || false,
      },
      include: {
        candidate: true,
      },
    });

    return resumeVersion;
  },
};
