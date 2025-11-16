"use client";

import { Question } from '@/lib/types';

type Props = {
  question: Question;
  value: string[];
  onChange: (selected: string[]) => void;
  index: number;
};

export function QuestionBlock({ question, value, onChange, index }: Props) {
  const isMulti = question.multiSelect ?? (question.correctOptionIds.length > 1);

  function toggle(optionId: string) {
    if (isMulti) {
      const set = new Set(value);
      if (set.has(optionId)) set.delete(optionId); else set.add(optionId);
      onChange([...set]);
    } else {
      onChange([optionId]);
    }
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-gray-500">Question {index + 1}</div>
          <div className="font-medium mt-1">{question.text}</div>
        </div>
        {question.marks != null && (
          <div className="text-sm text-gray-500">{question.marks} mark{question.marks === 1 ? '' : 's'}</div>
        )}
      </div>
      <div className="mt-3 space-y-2">
        {question.options.map((opt) => (
          <label key={opt.id} className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type={isMulti ? 'checkbox' : 'radio'}
              name={`q-${question.id}`}
              className="h-4 w-4"
              checked={value.includes(opt.id)}
              onChange={() => toggle(opt.id)}
            />
            <span>{opt.text}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
