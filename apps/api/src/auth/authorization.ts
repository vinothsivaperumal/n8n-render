import { Context, AuthContext, UserRole } from '../types/context';
import { AuthenticationError, AuthorizationError } from '../utils/errors';

export const requireAuth = (context: Context): AuthContext => {
  if (!context.user) {
    throw new AuthenticationError('You must be logged in to perform this action');
  }
  return context as AuthContext;
};

export const requireRole = (context: Context, allowedRoles: UserRole[]): AuthContext => {
  const authContext = requireAuth(context);
  
  if (!allowedRoles.includes(authContext.user.role)) {
    throw new AuthorizationError(
      `This action requires one of the following roles: ${allowedRoles.join(', ')}`
    );
  }
  
  return authContext;
};

export const isAdmin = (context: Context): boolean => {
  return context.user?.role === UserRole.ADMIN;
};

export const isRecruiter = (context: Context): boolean => {
  return context.user?.role === UserRole.RECRUITER;
};

export const isSales = (context: Context): boolean => {
  return context.user?.role === UserRole.SALES;
};

export const isFinance = (context: Context): boolean => {
  return context.user?.role === UserRole.FINANCE;
};

// Permission matrix for different operations
export const canManageCandidates = (context: Context): boolean => {
  return requireAuth(context).user.role in [UserRole.ADMIN, UserRole.RECRUITER];
};

export const canManageJobs = (context: Context): boolean => {
  return requireAuth(context).user.role in [UserRole.ADMIN, UserRole.SALES];
};

export const canManageApplications = (context: Context): boolean => {
  return requireAuth(context).user.role in [UserRole.ADMIN, UserRole.RECRUITER, UserRole.SALES];
};

export const canManageContracts = (context: Context): boolean => {
  return requireAuth(context).user.role in [UserRole.ADMIN, UserRole.FINANCE];
};

export const canViewDashboard = (context: Context): boolean => {
  // All authenticated users can view dashboard
  return !!requireAuth(context).user;
};
