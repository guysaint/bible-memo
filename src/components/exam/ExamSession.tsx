import { useRef, useState } from 'react';
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
  // 한글 IME 조합 입력이 state 반영 전에 채점되는 문제를 피하려고
  // 제어형 value 대신 ref로 두고 제출 시 DOM 값을 직접 읽는다.
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [hasText, setHasText] = useState(false);

  const verse = verses[index];
  const total = verses.length;

  const handleSubmit = () => {
    const text = taRef.current?.value ?? '';
    if (text.trim().length === 0) return;
    const { score } = scoreText(text, verse.text);
    const nextScores = { ...scores, [verse.id]: score };
    setScores(nextScores);
    setHasText(false);

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
        key={index}
        ref={taRef}
        defaultValue=""
        onChange={(e) => setHasText(e.target.value.trim().length > 0)}
        rows={8}
        autoFocus
        placeholder="본문을 입력하세요…"
        className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-3 font-serif text-base leading-relaxed text-gray-800 outline-none focus:border-bible-primary"
      />

      <button
        onClick={handleSubmit}
        disabled={!hasText}
        className="btn-primary w-full"
      >
        {index + 1 < total ? '제출하고 다음 구절' : '제출하고 결과 보기'}
      </button>
    </div>
  );
}
