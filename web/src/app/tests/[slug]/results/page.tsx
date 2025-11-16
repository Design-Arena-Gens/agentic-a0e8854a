"use client";

import { useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { getTestBySlug } from '@/lib/sample-tests';
import { computeResult, listAttempts } from '@/lib/storage';

export default function ResultsPage() {
  const params = useParams<{ slug: string }>();
  const sp = useSearchParams();
  const id = sp.get('id') ?? '';

  const test = useMemo(() => getTestBySlug(params.slug), [params.slug]);
  const attempt = useMemo(() => listAttempts().find((a) => a.id === id), [id]);

  if (!test) return <div className="text-red-600">Test not found.</div>;
  if (!attempt) return <div className="text-red-600">Attempt not found.</div>;

  const result = computeResult(test.questions, attempt);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{test.title} ? Results</h1>
          <p className="text-gray-600">Score: {result.score} / {result.totalMarks}</p>
        </div>
        <a href={`/tests/${test.slug}`} className="btn">Retake</a>
      </div>

      <div className="space-y-4">
        {test.questions.map((q, i) => {
          const detail = result.details.find((d) => d.questionId === q.id)!;
          const selected = new Set(attempt.answers.find((a) => a.questionId === q.id)?.selectedOptionIds ?? []);
          const correct = new Set(q.correctOptionIds);
          const color = detail.isCorrect ? 'border-green-400 bg-green-50' : 'border-red-300 bg-red-50';
          return (
            <div key={q.id} className={`rounded-lg border ${color} p-4`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-gray-600">Question {i + 1}</div>
                  <div className="font-medium mt-1">{q.text}</div>
                </div>
                <div className="text-sm text-gray-600">{detail.marksAwarded}/{detail.marksAvailable}</div>
              </div>
              <ul className="mt-3 space-y-1">
                {q.options.map((o) => (
                  <li key={o.id} className="flex items-center gap-2">
                    <span className={`inline-block h-2 w-2 rounded-full ${correct.has(o.id) ? 'bg-green-600' : 'bg-gray-300'}`} />
                    <span className={`${selected.has(o.id) ? 'font-medium' : ''}`}>{o.text}</span>
                    {selected.has(o.id) && !correct.has(o.id) && (
                      <span className="text-xs text-red-600 ml-2">(your choice)</span>
                    )}
                  </li>
                ))}
              </ul>
              {q.explanation && (
                <div className="mt-3 text-sm text-gray-700"><span className="font-medium">Explanation:</span> {q.explanation}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
