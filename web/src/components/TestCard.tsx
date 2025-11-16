"use client";

import Link from 'next/link';
import { Test } from '@/lib/types';
import { leaderboardForTest } from '@/lib/storage';

export function TestCard({ test }: { test: Test }) {
  const leaderboard = leaderboardForTest(test.slug);
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{test.title}</h3>
          {test.description && <p className="text-gray-600 mt-1">{test.description}</p>}
          <p className="text-sm text-gray-500 mt-2">Duration: {test.durationMinutes} minutes ? Questions: {test.questions.length}</p>
        </div>
        <div className="shrink-0">
          <Link href={`/tests/${test.slug}`} className="btn">Details</Link>
        </div>
      </div>
      {leaderboard.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Top scores</p>
          <ul className="space-y-1 text-sm text-gray-600">
            {leaderboard.map((r, i) => (
              <li key={r.id} className="flex justify-between">
                <span>#{i + 1}</span>
                <span>{r.score}/{r.total}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
