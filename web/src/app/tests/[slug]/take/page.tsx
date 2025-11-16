"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTestBySlug } from '@/lib/sample-tests';
import { Attempt } from '@/lib/types';
import { computeResult, saveAttempt } from '@/lib/storage';
import { QuestionBlock } from '@/components/Question';

export default function TakeTestPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const test = useMemo(() => getTestBySlug(params.slug), [params.slug]);

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    if (!test) return;
    const now = Date.now();
    const id = crypto.randomUUID();
    const initial: Attempt = {
      id,
      testSlug: test.slug,
      startedAt: now,
      answers: [],
    };
    setAttempt(initial);
    setRemainingMs(test.durationMinutes * 60 * 1000);
  }, [test]);

  useEffect(() => {
    if (remainingMs == null) return;
    if (remainingMs <= 0) {
      handleSubmit();
      return;
    }
    const t = setTimeout(() => setRemainingMs((ms) => (ms ?? 0) - 1000), 1000);
    return () => clearTimeout(t);
  }, [remainingMs]);

  if (!test) return <div className="text-red-600">Test not found.</div>;
  if (!attempt || remainingMs == null) return <div>Preparing your test...</div>;

  const q = test.questions[currentIndex];
  const ans = attempt.answers.find((a) => a.questionId === q.id);
  const selected = ans?.selectedOptionIds ?? [];

  function setAnswer(questionId: string, selectedOptionIds: string[]) {
    setAttempt((prev) => {
      if (!prev) return prev;
      const copy: Attempt = { ...prev, answers: [...prev.answers] };
      const idx = copy.answers.findIndex((a) => a.questionId === questionId);
      if (idx >= 0) copy.answers[idx] = { questionId, selectedOptionIds };
      else copy.answers.push({ questionId, selectedOptionIds });
      return copy;
    });
  }

  function handleSubmit() {
    setAttempt((prev) => {
      if (!prev) return prev;
      const finished = { ...prev, finishedAt: Date.now() };
      const result = computeResult(test.questions, finished);
      finished.score = result.score;
      finished.totalMarks = result.totalMarks;
      saveAttempt(finished);
      router.replace(`/tests/${test.slug}/results?id=${finished.id}`);
      return finished;
    });
  }

  const minutes = Math.max(0, Math.floor((remainingMs ?? 0) / 60000));
  const seconds = Math.max(0, Math.floor(((remainingMs ?? 0) % 60000) / 1000));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{test.title}</h1>
          <p className="text-sm text-gray-500">Question {currentIndex + 1} of {test.questions.length}</p>
        </div>
        <div className="text-lg font-mono tabular-nums">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
      </div>

      <QuestionBlock
        index={currentIndex}
        question={q}
        value={selected}
        onChange={(sel) => setAnswer(q.id, sel)}
      />

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            className="btn"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
          >Previous</button>
          <button
            className="btn"
            onClick={() => setCurrentIndex((i) => Math.min(test.questions.length - 1, i + 1))}
            disabled={currentIndex === test.questions.length - 1}
          >Next</button>
        </div>
        <button className="btn bg-green-600 hover:bg-green-700" onClick={handleSubmit}>Submit</button>
      </div>

      <div className="card">
        <div className="text-sm font-medium mb-2">Quick Navigate</div>
        <div className="grid grid-cols-8 gap-2">
          {test.questions.map((_, i) => {
            const answered = attempt.answers.some((a) => a.questionId === test.questions[i].id && a.selectedOptionIds.length > 0);
            return (
              <button
                key={i}
                className={`rounded-md border px-3 py-2 text-sm ${i===currentIndex?'bg-blue-50 border-blue-400':'bg-white'} ${answered?'border-green-400':''}`}
                onClick={() => setCurrentIndex(i)}
              >{i + 1}</button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
