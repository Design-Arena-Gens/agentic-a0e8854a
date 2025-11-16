"use client";

import { useMemo, useState } from 'react';
import { defaultTests } from '@/lib/sample-tests';
import { Test, Question, Option } from '@/lib/types';
import { exportTestsJSON, importTestsJSON, loadCustomTests, saveCustomTests } from '@/lib/storage';

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

function emptyTest(): Test {
  return {
    slug: '',
    title: '',
    description: '',
    durationMinutes: 30,
    questions: [
      {
        id: newId('q'),
        text: '',
        options: [
          { id: newId('o'), text: '' },
          { id: newId('o'), text: '' },
        ],
        correctOptionIds: [],
        marks: 1,
        multiSelect: false,
      },
    ],
  };
}

export default function AdminPage() {
  const [custom, setCustom] = useState<Test[]>(() => loadCustomTests());
  const [editing, setEditing] = useState<Test | null>(null);
  const [jsonText, setJsonText] = useState('');

  const all = useMemo(() => {
    const existingSlugs = new Set(custom.map((t) => t.slug));
    const merged = [
      ...custom,
      ...defaultTests.filter((t) => !existingSlugs.has(t.slug)),
    ];
    return merged;
  }, [custom]);

  function startNew() {
    setEditing(emptyTest());
  }

  function editSlug(slug: string) {
    const t = custom.find((t) => t.slug === slug) || defaultTests.find((t) => t.slug === slug);
    if (t) setEditing(JSON.parse(JSON.stringify(t)) as Test);
  }

  function removeCustom(slug: string) {
    const next = custom.filter((t) => t.slug !== slug);
    setCustom(next);
    saveCustomTests(next);
  }

  function saveCurrent() {
    if (!editing) return;
    if (!editing.slug || !editing.title) {
      alert('Slug and Title are required');
      return;
    }
    const next = [...custom.filter((t) => t.slug !== editing.slug), editing];
    setCustom(next);
    saveCustomTests(next);
    setEditing(null);
  }

  function exportJSON() {
    setJsonText(exportTestsJSON(custom));
  }

  function importJSON() {
    try {
      const imported = importTestsJSON(jsonText);
      setCustom(imported);
      saveCustomTests(imported);
      alert('Imported tests successfully');
    } catch (e) {
      alert('Failed to import JSON');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <div className="flex gap-2">
          <button className="btn" onClick={startNew}>New Test</button>
          <button className="btn" onClick={exportJSON}>Export JSON</button>
          <button className="btn" onClick={importJSON}>Import JSON</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="font-medium">All Tests</h2>
          {all.map((t) => (
            <div key={t.slug} className="card flex items-center justify-between">
              <div>
                <div className="font-medium">{t.title}</div>
                <div className="text-sm text-gray-600">/{t.slug} ? {t.questions.length} q ? {t.durationMinutes} min {custom.some((c)=>c.slug===t.slug) ? '? custom' : ''}</div>
              </div>
              <div className="flex gap-2">
                <button className="btn" onClick={() => editSlug(t.slug)}>Edit</button>
                {custom.some((c) => c.slug === t.slug) && (
                  <button className="btn bg-red-600 hover:bg-red-700" onClick={() => removeCustom(t.slug)}>Delete</button>
                )}
              </div>
            </div>
          ))}
          {all.length === 0 && (
            <div className="text-gray-600">No tests yet. Create one or import JSON.</div>
          )}

          <div className="card">
            <h3 className="font-medium mb-2">Import/Export JSON</h3>
            <textarea
              className="w-full border rounded-md p-2 h-48"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="Paste JSON here to import or copy exported JSON"
            />
          </div>
        </div>

        <div>
          {editing ? (
            <Editor test={editing} onChange={setEditing} onSave={saveCurrent} onCancel={() => setEditing(null)} />
          ) : (
            <div className="card text-gray-600">Select a test to edit, or create a new one.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Editor({ test, onChange, onSave, onCancel }: { test: Test; onChange: (t: Test)=>void; onSave: ()=>void; onCancel: ()=>void }) {
  function update<K extends keyof Test>(key: K, value: Test[K]) {
    onChange({ ...test, [key]: value });
  }

  function addQuestion() {
    const q: Question = {
      id: newId('q'),
      text: '',
      options: [ { id: newId('o'), text: '' }, { id: newId('o'), text: '' } ],
      correctOptionIds: [],
      marks: 1,
      multiSelect: false,
    };
    update('questions', [...test.questions, q]);
  }

  function updateQuestion(index: number, q: Question) {
    const copy = [...test.questions];
    copy[index] = q;
    update('questions', copy);
  }

  function removeQuestion(index: number) {
    const copy = [...test.questions];
    copy.splice(index, 1);
    update('questions', copy);
  }

  return (
    <div className="space-y-4">
      <div className="card space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="space-y-1">
            <div className="text-sm text-gray-600">Slug</div>
            <input className="border rounded-md p-2 w-full" value={test.slug} onChange={(e)=>update('slug', e.target.value)} placeholder="e.g. my-test" />
          </label>
          <label className="space-y-1">
            <div className="text-sm text-gray-600">Title</div>
            <input className="border rounded-md p-2 w-full" value={test.title} onChange={(e)=>update('title', e.target.value)} placeholder="Descriptive title" />
          </label>
        </div>
        <label className="space-y-1 block">
          <div className="text-sm text-gray-600">Description</div>
          <textarea className="border rounded-md p-2 w-full" value={test.description ?? ''} onChange={(e)=>update('description', e.target.value)} />
        </label>
        <label className="space-y-1 block max-w-xs">
          <div className="text-sm text-gray-600">Duration (minutes)</div>
          <input type="number" className="border rounded-md p-2 w-full" value={test.durationMinutes} onChange={(e)=>update('durationMinutes', Number(e.target.value))} />
        </label>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-medium">Questions ({test.questions.length})</h3>
        <button className="btn" onClick={addQuestion}>Add Question</button>
      </div>

      <div className="space-y-4">
        {test.questions.map((q, i) => (
          <QuestionEditor key={q.id} q={q} index={i} onChange={(newQ)=>updateQuestion(i, newQ)} onRemove={()=>removeQuestion(i)} />
        ))}
      </div>

      <div className="flex gap-2">
        <button className="btn" onClick={onSave}>Save</button>
        <button className="btn bg-gray-200 text-gray-900 hover:bg-gray-300" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function QuestionEditor({ q, index, onChange, onRemove }: { q: Question; index: number; onChange: (q: Question)=>void; onRemove: ()=>void }) {
  function update<K extends keyof Question>(key: K, value: Question[K]) {
    onChange({ ...q, [key]: value });
  }

  function addOption() {
    const opt: Option = { id: newId('o'), text: '' };
    update('options', [...q.options, opt]);
  }

  function updateOption(idx: number, opt: Option) {
    const copy = [...q.options];
    copy[idx] = opt;
    update('options', copy);
  }

  function removeOption(idx: number) {
    const copy = [...q.options];
    const removed = copy.splice(idx, 1)[0];
    update('options', copy);
    update('correctOptionIds', q.correctOptionIds.filter((id) => id !== removed.id));
  }

  function toggleCorrect(id: string) {
    const set = new Set(q.correctOptionIds);
    if (set.has(id)) set.delete(id); else set.add(id);
    update('correctOptionIds', [...set]);
  }

  return (
    <div className="card space-y-3">
      <div className="flex items-start justify-between">
        <div className="text-sm text-gray-600">Question {index + 1}</div>
        <button className="text-red-600 text-sm" onClick={onRemove}>Remove</button>
      </div>
      <label className="space-y-1 block">
        <div className="text-sm text-gray-600">Text</div>
        <textarea className="border rounded-md p-2 w-full" value={q.text} onChange={(e)=>update('text', e.target.value)} />
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <label className="space-y-1 block">
          <div className="text-sm text-gray-600">Marks</div>
          <input type="number" className="border rounded-md p-2 w-full" value={q.marks ?? 1} onChange={(e)=>update('marks', Number(e.target.value))} />
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={q.multiSelect ?? false} onChange={(e)=>update('multiSelect', e.target.checked)} />
          <span>Allow multiple answers</span>
        </label>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Options</div>
        {q.options.map((o, idx) => (
          <div key={o.id} className="flex items-center gap-2">
            <input
              type={q.multiSelect ? 'checkbox' : 'radio'}
              checked={q.correctOptionIds.includes(o.id)}
              onChange={() => toggleCorrect(o.id)}
            />
            <input className="border rounded-md p-2 w-full" value={o.text} onChange={(e)=>updateOption(idx, { ...o, text: e.target.value })} placeholder={`Option ${idx + 1}`} />
            <button className="text-red-600" onClick={()=>removeOption(idx)}>Remove</button>
          </div>
        ))}
        <button className="btn" onClick={addOption}>Add Option</button>
      </div>

      <label className="space-y-1 block">
        <div className="text-sm text-gray-600">Explanation (shown in results)</div>
        <textarea className="border rounded-md p-2 w-full" value={q.explanation ?? ''} onChange={(e)=>update('explanation', e.target.value)} />
      </label>
    </div>
  );
}
