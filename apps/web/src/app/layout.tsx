import './globals.css';
import type { Metadata } from 'next';
import { ApolloProvider } from '@/lib/apollo-provider';

export const metadata: Metadata = {
  title: 'Narpavi ATS - Applicant Tracking System',
  description: 'Modern applicant tracking system built with Next.js and GraphQL',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ApolloProvider>{children}</ApolloProvider>
      </body>
    </html>
  );
}
