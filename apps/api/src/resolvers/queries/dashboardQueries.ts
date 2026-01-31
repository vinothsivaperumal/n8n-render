import { Context } from '../../types/context';
import { requireAuth } from '../../auth/authorization';

interface DateRangeInput {
  from?: Date;
  to?: Date;
}

export const dashboardQueries = {
  dashboardMetrics: async (
    _parent: any,
    args: { dateRange?: DateRangeInput },
    context: Context
  ) => {
    // All authenticated users can view dashboard
    requireAuth(context);

    const { dateRange } = args;
    const where: any = { deletedAt: null };

    if (dateRange) {
      if (dateRange.from) {
        where.createdAt = { gte: dateRange.from };
      }
      if (dateRange.to) {
        where.createdAt = { ...where.createdAt, lte: dateRange.to };
      }
    }

    // Get total counts
    const [totalCandidates, totalJobs, totalApplications] = await Promise.all([
      context.prisma.candidate.count({ where: { deletedAt: null } }),
      context.prisma.job.count({ where: { deletedAt: null } }),
      context.prisma.application.count({ where }),
    ]);

    // Get applications by stage
    const stageGroups = await context.prisma.application.groupBy({
      by: ['currentStage'],
      where,
      _count: {
        id: true,
      },
    });

    const applicationsByStage = stageGroups.map((group) => ({
      stage: group.currentStage,
      count: group._count.id,
    }));

    // Calculate placement rate
    const placedCount = await context.prisma.application.count({
      where: {
        ...where,
        currentStage: 'PLACED',
      },
    });
    const placementRate = totalApplications > 0 ? (placedCount / totalApplications) * 100 : 0;

    // Calculate average time to placement
    const placedApplications = await context.prisma.application.findMany({
      where: {
        ...where,
        currentStage: 'PLACED',
        startDate: { not: null },
      },
      select: {
        submittedAt: true,
        startDate: true,
      },
    });

    let averageTimeToPlacement = null;
    if (placedApplications.length > 0) {
      const totalDays = placedApplications.reduce((sum, app) => {
        const days = Math.floor(
          (app.startDate!.getTime() - app.submittedAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }, 0);
      averageTimeToPlacement = totalDays / placedApplications.length;
    }

    // Get top vendors
    const vendorGroups = await context.prisma.application.groupBy({
      by: ['vendorId'],
      where: {
        ...where,
        vendorId: { not: null },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    const topVendors = await Promise.all(
      vendorGroups.map(async (group) => {
        const vendor = await context.prisma.vendor.findUnique({
          where: { id: group.vendorId! },
        });

        const placementCount = await context.prisma.application.count({
          where: {
            ...where,
            vendorId: group.vendorId,
            currentStage: 'PLACED',
          },
        });

        const submissionCount = group._count.id;
        const placementRate = submissionCount > 0 ? (placementCount / submissionCount) * 100 : 0;

        return {
          vendor,
          submissionCount,
          placementCount,
          placementRate,
        };
      })
    );

    // Get recent activity
    const recentApplications = await context.prisma.application.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        candidate: true,
        job: true,
      },
    });

    const recentActivity = recentApplications.map((app) => ({
      id: app.id,
      type: 'APPLICATION',
      description: `${app.candidate.firstName} ${app.candidate.lastName} applied to ${app.job.title}`,
      timestamp: app.createdAt,
      metadata: {
        candidateId: app.candidateId,
        jobId: app.jobId,
        stage: app.currentStage,
      },
    }));

    return {
      totalCandidates,
      totalJobs,
      totalApplications,
      applicationsByStage,
      placementRate,
      averageTimeToPlacement,
      topVendors,
      recentActivity,
    };
  },
};
