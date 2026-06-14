import { useState } from 'react';
import type { Verse } from '../../types';
import { scoreText } from '../../services/scoring';
import { verseRef } from '../../services/verseLabel';
import { ProgressBar } from '../ui/ProgressBar';

interface ExamSessionProps {
  groupIndex: number;
  verses: Verse[]; // 4개
  onComplete: (scores: Record<string, number>) => void;
  onCancel: () => void;
}

export function ExamSession({ groupIndex, verses, onComplete, onCancel }: ExamSessionProps) {
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [input, setInput] = useState('');

  const verse = verses[index];
  const total = verses.length;

  const handleSubmit = () => {
    const { score } = scoreText(input, verse.text);
    const nextScores = { ...scores, [verse.id]: score };
    setScores(nextScores);
    setInput('');

    if (index + 1 < total) {
      setIndex(index + 1);
    } else {
      onComplete(nextScores);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="text-sm font-medium text-gray-500 transition-active">
          ← 나가기
        </button>
        <span className="text-sm font-semibold text-bible-primary">
          {groupIndex}묶음 시험 · {index + 1}/{total}
        </span>
      </div>

      <ProgressBar value={((index) / total) * 100} />

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-xs text-gray-400">다음 구절을 기억나는 대로 입력하세요</p>
        <p className="mt-1 text-xl font-bold text-bible-primary">{verseRef(verse)}</p>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={8}
        autoFocus
        placeholder="본문을 입력하세요…"
        className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-3 font-serif text-base leading-relaxed text-gray-800 outline-none focus:border-bible-primary"
      />

      <button
        onClick={handleSubmit}
        disabled={input.trim().length === 0}
        className="btn-primary w-full"
      >
        {index + 1 < total ? '제출하고 다음 구절' : '제출하고 결과 보기'}
      </button>
    </div>
  );
}
