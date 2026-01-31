import { PrismaClient } from '@narpavi-ats/db';
import { DuplicateError, RTRRequiredError, ValidationError } from '../utils/errors';

/**
 * Check if an application is a duplicate
 * Business rule: Same candidate + job + within 90-day period
 */
export const checkDuplicateApplication = async (
  prisma: PrismaClient,
  candidateId: string,
  jobId: string
): Promise<void> => {
  // Calculate duplicate check date (rounded to 90-day period)
  const now = new Date();
  const duplicateCheckDate = new Date(
    now.getFullYear(),
    Math.floor(now.getMonth() / 3) * 3,
    1
  );

  const existing = await prisma.application.findFirst({
    where: {
      candidateId,
      jobId,
      duplicateCheckDate,
      deletedAt: null,
    },
    include: {
      candidate: true,
      job: true,
    },
  });

  if (existing) {
    throw new DuplicateError(
      `Duplicate submission: ${existing.candidate.firstName} ${existing.candidate.lastName} ` +
      `has already been submitted to "${existing.job.title}" within the current submission period`
    );
  }
};

/**
 * Validate RTR requirement for vendor submissions
 * Business rule: Vendor submissions require a valid, signed RTR
 */
export const validateRTRRequirement = async (
  prisma: PrismaClient,
  candidateId: string,
  vendorId?: string
): Promise<string | null> => {
  // If no vendor, RTR is not required (direct application)
  if (!vendorId) {
    return null;
  }

  // Check for valid RTR
  const validRTR = await prisma.rightToRepresent.findFirst({
    where: {
      candidateId,
      status: 'SIGNED',
      validFrom: { lte: new Date() },
      validUntil: { gte: new Date() },
      deletedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!validRTR) {
    throw new RTRRequiredError(
      'A valid, signed RTR (Right to Represent) is required for vendor submissions. ' +
      'The RTR must be signed by both the candidate and vendor, and must be currently valid.'
    );
  }

  return validRTR.id;
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): void => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format', 'email');
  }
};

/**
 * Validate phone format (basic validation)
 */
export const validatePhone = (phone: string): void => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  if (!phoneRegex.test(phone)) {
    throw new ValidationError('Invalid phone format', 'phone');
  }
};

/**
 * Validate date is in the future
 */
export const validateFutureDate = (date: Date, fieldName: string): void => {
  if (date < new Date()) {
    throw new ValidationError(`${fieldName} must be in the future`, fieldName);
  }
};

/**
 * Validate date range
 */
export const validateDateRange = (start: Date, end: Date, fieldName: string = 'date'): void => {
  if (end < start) {
    throw new ValidationError(`End date must be after start date`, fieldName);
  }
};

/**
 * Calculate duplicate check date for a given date
 * Rounds to the start of the nearest 90-day quarter
 */
export const calculateDuplicateCheckDate = (date: Date = new Date()): Date => {
  return new Date(
    date.getFullYear(),
    Math.floor(date.getMonth() / 3) * 3,
    1
  );
};
