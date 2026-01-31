'use client';

import { useQuery } from '@apollo/client';
import { GET_JOBS } from '@/graphql/queries';
import { formatDate } from '@narpavi-ats/shared';

export default function Home() {
  const { data, loading, error } = useQuery(GET_JOBS);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Narpavi ATS</h1>
          <p className="text-gray-600">Applicant Tracking System</p>
        </header>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Open Positions</h2>

          {loading && <p>Loading jobs...</p>}
          {error && <p className="text-red-500">Error loading jobs: {error.message}</p>}

          {data?.jobs && (
            <div className="grid gap-4">
              {data.jobs.map((job: any) => (
                <div key={job.id} className="border p-6 rounded-lg shadow-sm hover:shadow-md transition">
                  <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                  <p className="text-gray-600 mb-2">{job.description}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>📍 {job.location}</span>
                    <span>🏢 {job.department}</span>
                    <span>💼 {job.type.replace('_', ' ')}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Posted: {formatDate(job.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {data?.jobs?.length === 0 && (
            <p className="text-gray-500">No open positions at the moment.</p>
          )}
        </section>
      </div>
    </main>
  );
}
