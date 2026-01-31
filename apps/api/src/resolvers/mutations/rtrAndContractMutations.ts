import { Context } from '../../types/context';
import { requireRole, UserRole } from '../../auth/authorization';
import { NotFoundError, ValidationError } from '../../utils/errors';
import { validateFutureDate } from '../../validation/businessRules';

interface RequestRTRInput {
  candidateId: string;
  vendorId?: string;
  clientId?: string;
  validUntil: Date;
}

interface ConfirmRTRInput {
  rtrId: string;
  signature: string;
  ipAddress?: string;
}

interface CreateContractInput {
  applicationId: string;
  contractType: string;
  startDate: Date;
  endDate?: Date;
  candidateRate: number;
  billRate: number;
  payType: string;
}

interface UpdateContractInput {
  startDate?: Date;
  endDate?: Date;
}

export const rtrAndContractMutations = {
  requestRTR: async (
    _parent: any,
    args: { input: RequestRTRInput },
    context: Context
  ) => {
    // Require ADMIN or RECRUITER role
    requireRole(context, [UserRole.ADMIN, UserRole.RECRUITER]);

    const { input } = args;

    // Validate candidate exists
    const candidate = await context.prisma.candidate.findUnique({
      where: { id: input.candidateId },
    });

    if (!candidate || candidate.deletedAt) {
      throw new NotFoundError('Candidate', input.candidateId);
    }

    // Validate vendor if provided
    if (input.vendorId) {
      const vendor = await context.prisma.vendor.findUnique({
        where: { id: input.vendorId },
      });

      if (!vendor || vendor.deletedAt) {
        throw new NotFoundError('Vendor', input.vendorId);
      }
    }

    // Validate client if provided
    if (input.clientId) {
      const client = await context.prisma.client.findUnique({
        where: { id: input.clientId },
      });

      if (!client || client.deletedAt) {
        throw new NotFoundError('Client', input.clientId);
      }
    }

    // Validate validUntil is in the future
    validateFutureDate(new Date(input.validUntil), 'validUntil');

    // Create RTR
    const rtr = await context.prisma.rightToRepresent.create({
      data: {
        candidateId: input.candidateId,
        vendorId: input.vendorId,
        clientId: input.clientId,
        validFrom: new Date(),
        validUntil: new Date(input.validUntil),
        status: 'PENDING',
      },
      include: {
        candidate: true,
      },
    });

    return rtr;
  },

  confirmRTR: async (
    _parent: any,
    args: { input: ConfirmRTRInput },
    context: Context
  ) => {
    // Require ADMIN or RECRUITER role
    requireRole(context, [UserRole.ADMIN, UserRole.RECRUITER]);

    const { input } = args;

    // Validate RTR exists
    const existing = await context.prisma.rightToRepresent.findUnique({
      where: { id: input.rtrId },
    });

    if (!existing || existing.deletedAt) {
      throw new NotFoundError('RTR', input.rtrId);
    }

    if (existing.status === 'SIGNED') {
      throw new ValidationError('RTR is already signed');
    }

    // Update RTR with signature
    const rtr = await context.prisma.rightToRepresent.update({
      where: { id: input.rtrId },
      data: {
        signedByCandidateAt: new Date(),
        candidateSignature: input.signature,
        candidateIpAddress: input.ipAddress,
        signedByVendorAt: new Date(),
        vendorSignature: input.signature,
        vendorIpAddress: input.ipAddress,
        status: 'SIGNED',
      },
      include: {
        candidate: true,
      },
    });

    return rtr;
  },

  createContract: async (
    _parent: any,
    args: { input: CreateContractInput },
    context: Context
  ) => {
    // Require ADMIN or FINANCE role
    requireRole(context, [UserRole.ADMIN, UserRole.FINANCE]);

    const { input } = args;

    // Validate application exists
    const application = await context.prisma.application.findUnique({
      where: { id: input.applicationId },
      include: {
        candidate: true,
        job: true,
      },
    });

    if (!application || application.deletedAt) {
      throw new NotFoundError('Application', input.applicationId);
    }

    // Check if contract already exists
    const existingContract = await context.prisma.contract.findUnique({
      where: { applicationId: input.applicationId },
    });

    if (existingContract) {
      throw new ValidationError('Contract already exists for this application');
    }

    // Calculate margin
    const margin = input.billRate - input.candidateRate;
    const marginPercent = (margin / input.billRate) * 100;

    // Create contract with initial rate
    const contract = await context.prisma.contract.create({
      data: {
        applicationId: input.applicationId,
        candidateId: application.candidateId,
        vendorId: application.vendorId,
        contractType: input.contractType as any,
        startDate: new Date(input.startDate),
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        rates: {
          create: {
            candidateRate: input.candidateRate,
            billRate: input.billRate,
            payType: input.payType as any,
            margin,
            marginPercent,
            effectiveFrom: new Date(input.startDate),
          },
        },
      },
      include: {
        application: true,
        candidate: true,
        vendor: true,
        rates: true,
      },
    });

    return contract;
  },

  updateContract: async (
    _parent: any,
    args: { id: string; input: UpdateContractInput },
    context: Context
  ) => {
    // Require ADMIN or FINANCE role
    requireRole(context, [UserRole.ADMIN, UserRole.FINANCE]);

    const { id, input } = args;

    // Validate contract exists
    const existing = await context.prisma.contract.findUnique({
      where: { id },
    });

    if (!existing || existing.deletedAt) {
      throw new NotFoundError('Contract', id);
    }

    // Update contract
    const contract = await context.prisma.contract.update({
      where: { id },
      data: {
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
      },
      include: {
        application: true,
        candidate: true,
        vendor: true,
        rates: true,
      },
    });

    return contract;
  },
};
