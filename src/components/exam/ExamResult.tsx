import { useEffect, useState } from 'react';
import type { Verse } from '../../types';
import { EXAM_PASS_SCORE } from '../../types';
import { verseRef } from '../../services/verseLabel';
import { Confetti } from '../ui/Confetti';

interface ExamResultProps {
  groupIndex: number;
  verses: Verse[];
  scores: Record<string, number>;
  average: number;
  isPassed: boolean;
  /** 취약 구절 집중 연습 (직접입력) */
  onFocusPractice: (verseId: string) => void;
  onRetry: () => void;
  onDone: () => void;
}

function barColor(score: number): string {
  if (score >= EXAM_PASS_SCORE) return 'bg-bible-primary';
  if (score >= 50) return 'bg-bible-accent';
  return 'bg-red-400';
}

export function ExamResult({
  groupIndex,
  verses,
  scores,
  average,
  isPassed,
  onFocusPractice,
  onRetry,
  onDone,
}: ExamResultProps) {
  const [showConfetti, setShowConfetti] = useState(isPassed);

  useEffect(() => {
    if (!isPassed) return;
    const t = window.setTimeout(() => setShowConfetti(false), 4000);
    return () => window.clearTimeout(t);
  }, [isPassed]);

  // 점수 낮은 순(취약 구절) 정렬
  const weakest = [...verses].sort((a, b) => (scores[a.id] ?? 0) - (scores[b.id] ?? 0));

  return (
    <div className="space-y-5">
      {showConfetti && <Confetti />}

      {/* 평균 점수 */}
      <div
        className={`rounded-2xl p-6 text-center shadow-sm ${
          isPassed ? 'bg-bible-primary text-white' : 'bg-white'
        }`}
      >
        <p className={`text-sm ${isPassed ? 'text-white/80' : 'text-gray-500'}`}>
          {groupIndex}묶음 평균 점수
        </p>
        <p className="mt-1 text-5xl font-bold">{average}점</p>
        {isPassed ? (
          <p className="mt-3 text-lg font-bold">🎉 {groupIndex}묶음 마스터 달성!</p>
        ) : (
          <p className="mt-3 text-sm text-gray-500">
            평균 {EXAM_PASS_SCORE}점 이상이면 합격이에요. 조금만 더!
          </p>
        )}
      </div>

      {/* 구절별 점수 바 */}
      <section className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-600">구절별 점수</h3>
        {verses.map((v) => {
          const score = scores[v.id] ?? 0;
          return (
            <div key={v.id}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-medium text-gray-700">{verseRef(v)}</span>
                <span className="text-gray-500">{score}점</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${barColor(score)}`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        })}
      </section>

      {/* 불합격: 취약 구절 안내 */}
      {!isPassed && (
        <section className="rounded-2xl bg-amber-50 p-5">
          <h3 className="mb-2 text-sm font-semibold text-amber-800">집중하면 좋은 구절</h3>
          <ul className="space-y-1.5">
            {weakest.slice(0, 2).map((v) => (
              <li key={v.id} className="flex items-center justify-between text-sm">
                <span className="text-amber-900">
                  {verseRef(v)} · {scores[v.id] ?? 0}점
                </span>
                <button
                  onClick={() => onFocusPractice(v.id)}
                  className="rounded-lg bg-bible-accent px-3 py-1 text-xs font-semibold text-white transition-active"
                >
                  집중 연습
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 액션 */}
      <div className="flex gap-2">
        {!isPassed && (
          <button onClick={onRetry} className="btn-secondary flex-1">
            다시 시험 보기
          </button>
        )}
        <button onClick={onDone} className="btn-primary flex-1">
          {isPassed ? '완료' : '나중에'}
        </button>
      </div>
    </div>
  );
}
