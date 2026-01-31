import {
  checkDuplicateApplication,
  validateRTRRequirement,
  calculateDuplicateCheckDate,
} from '../businessRules';
import { DuplicateError, RTRRequiredError } from '../../utils/errors';

// Mock Prisma Client
const mockPrisma = {
  application: {
    findFirst: jest.fn(),
  },
  rightToRepresent: {
    findFirst: jest.fn(),
  },
} as any;

describe('Business Rules Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkDuplicateApplication', () => {
    const candidateId = 'candidate-1';
    const jobId = 'job-1';

    it('should pass when no duplicate exists', async () => {
      mockPrisma.application.findFirst.mockResolvedValue(null);

      await expect(
        checkDuplicateApplication(mockPrisma, candidateId, jobId)
      ).resolves.not.toThrow();

      expect(mockPrisma.application.findFirst).toHaveBeenCalledWith({
        where: {
          candidateId,
          jobId,
          duplicateCheckDate: expect.any(Date),
          deletedAt: null,
        },
        include: {
          candidate: true,
          job: true,
        },
      });
    });

    it('should throw DuplicateError when duplicate exists', async () => {
      const existingApplication = {
        id: 'app-1',
        candidateId,
        jobId,
        candidate: {
          firstName: 'John',
          lastName: 'Doe',
        },
        job: {
          title: 'Senior Developer',
        },
      };

      mockPrisma.application.findFirst.mockResolvedValue(existingApplication);

      await expect(
        checkDuplicateApplication(mockPrisma, candidateId, jobId)
      ).rejects.toThrow(DuplicateError);

      await expect(
        checkDuplicateApplication(mockPrisma, candidateId, jobId)
      ).rejects.toThrow(/Duplicate submission.*John Doe.*Senior Developer/);
    });
  });

  describe('validateRTRRequirement', () => {
    const candidateId = 'candidate-1';
    const vendorId = 'vendor-1';

    it('should return null when no vendor is provided (direct application)', async () => {
      const result = await validateRTRRequirement(mockPrisma, candidateId, undefined);

      expect(result).toBeNull();
      expect(mockPrisma.rightToRepresent.findFirst).not.toHaveBeenCalled();
    });

    it('should return RTR id when valid RTR exists', async () => {
      const validRTR = {
        id: 'rtr-1',
        candidateId,
        vendorId,
        status: 'SIGNED',
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2025-01-01'),
        deletedAt: null,
      };

      mockPrisma.rightToRepresent.findFirst.mockResolvedValue(validRTR);

      const result = await validateRTRRequirement(mockPrisma, candidateId, vendorId);

      expect(result).toBe('rtr-1');
      expect(mockPrisma.rightToRepresent.findFirst).toHaveBeenCalledWith({
        where: {
          candidateId,
          status: 'SIGNED',
          validFrom: { lte: expect.any(Date) },
          validUntil: { gte: expect.any(Date) },
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should throw RTRRequiredError when no valid RTR exists', async () => {
      mockPrisma.rightToRepresent.findFirst.mockResolvedValue(null);

      await expect(
        validateRTRRequirement(mockPrisma, candidateId, vendorId)
      ).rejects.toThrow(RTRRequiredError);

      await expect(
        validateRTRRequirement(mockPrisma, candidateId, vendorId)
      ).rejects.toThrow(/valid, signed RTR.*required/i);
    });
  });

  describe('calculateDuplicateCheckDate', () => {
    it('should round to Q1 (Jan-Mar)', () => {
      const date = new Date('2024-02-15');
      const result = calculateDuplicateCheckDate(date);
      expect(result).toEqual(new Date(2024, 0, 1)); // Jan 1, 2024
    });

    it('should round to Q2 (Apr-Jun)', () => {
      const date = new Date('2024-05-15');
      const result = calculateDuplicateCheckDate(date);
      expect(result).toEqual(new Date(2024, 3, 1)); // Apr 1, 2024
    });

    it('should round to Q3 (Jul-Sep)', () => {
      const date = new Date('2024-08-15');
      const result = calculateDuplicateCheckDate(date);
      expect(result).toEqual(new Date(2024, 6, 1)); // Jul 1, 2024
    });

    it('should round to Q4 (Oct-Dec)', () => {
      const date = new Date('2024-11-15');
      const result = calculateDuplicateCheckDate(date);
      expect(result).toEqual(new Date(2024, 9, 1)); // Oct 1, 2024
    });
  });
});
