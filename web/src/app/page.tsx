import Link from 'next/link';
import { getAllTests } from '@/lib/sample-tests';
import { TestCard } from '@/components/TestCard';

export default function HomePage() {
  const tests = getAllTests();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Available Mock Tests</h1>
        <p className="text-gray-600">Choose a test to begin. Your progress and leaderboard are stored locally in your browser.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tests.map((t) => (
          <TestCard key={t.slug} test={t} />
        ))}
      </div>
    </div>
  );
}
