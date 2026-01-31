import { PrismaClient } from '@narpavi-ats/db';

export enum UserRole {
  ADMIN = 'ADMIN',
  RECRUITER = 'RECRUITER',
  SALES = 'SALES',
  FINANCE = 'FINANCE',
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface Context {
  prisma: PrismaClient;
  user?: AuthUser;
}

export interface AuthContext extends Context {
  user: AuthUser;
}
