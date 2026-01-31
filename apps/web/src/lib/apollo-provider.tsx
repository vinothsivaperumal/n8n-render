'use client';

import { ApolloClient, InMemoryCache, ApolloProvider as ApolloClientProvider } from '@apollo/client';
import { ReactNode } from 'react';

const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
});

export function ApolloProvider({ children }: { children: ReactNode }) {
  return <ApolloClientProvider client={client}>{children}</ApolloClientProvider>;
}
