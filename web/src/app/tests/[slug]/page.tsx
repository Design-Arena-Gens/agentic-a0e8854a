import Link from 'next/link';
import { getTestBySlug } from '@/lib/sample-tests';
import { notFound } from 'next/navigation';

export default function TestDetailPage({ params }: { params: { slug: string } }) {
  const test = getTestBySlug(params.slug);
  if (!test) return notFound();
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold">{test.title}</h1>
          {test.description && <p className="text-gray-600 mt-2 max-w-2xl">{test.description}</p>}
          <p className="text-sm text-gray-500 mt-2">Duration: {test.durationMinutes} minutes ? Questions: {test.questions.length}</p>
        </div>
        <div className="shrink-0">
          <Link href={`/tests/${test.slug}/take`} className="btn">Start Test</Link>
        </div>
      </div>
      <div className="card">
        <h2 className="font-medium mb-2">What to expect</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>Timer starts when you begin. Auto-submits when time runs out.</li>
          <li>You can navigate between questions at any time.</li>
          <li>Results include score and detailed explanations.</li>
        </ul>
      </div>
    </div>
  );
}
