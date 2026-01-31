import { DateTimeScalar, JSONScalar } from '../graphql/scalars';
import { candidateQueries } from './queries/candidateQueries';
import { jobQueries } from './queries/jobQueries';
import { applicationQueries } from './queries/applicationQueries';
import { dashboardQueries } from './queries/dashboardQueries';
import { otherQueries } from './queries/otherQueries';
import { candidateMutations } from './mutations/candidateMutations';
import { jobMutations } from './mutations/jobMutations';
import { applicationMutations } from './mutations/applicationMutations';
import { rtrAndContractMutations } from './mutations/rtrAndContractMutations';
import { typeResolvers } from './types/typeResolvers';

export const resolvers = {
  // Custom Scalars
  DateTime: DateTimeScalar,
  JSON: JSONScalar,

  // Queries
  Query: {
    ...candidateQueries,
    ...jobQueries,
    ...applicationQueries,
    ...dashboardQueries,
    ...otherQueries,
  },

  // Mutations
  Mutation: {
    ...candidateMutations,
    ...jobMutations,
    ...applicationMutations,
    ...rtrAndContractMutations,
  },

  // Type Resolvers
  ...typeResolvers,
};
