import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ApolloProvider } from '@/lib/apollo-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Narpavi ATS - Applicant Tracking System',
  description: 'Modern applicant tracking system built with Next.js and GraphQL',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ApolloProvider>{children}</ApolloProvider>
      </body>
    </html>
  );
}
