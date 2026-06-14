import type { Verse } from '../../types';
import { GROUP_SIZE } from '../../types';

interface GroupProgressProps {
  groupIndex: number;
  verses: Verse[];
  isComplete: boolean;
  onStartExam?: () => void;
}

export function GroupProgress({
  groupIndex,
  verses,
  isComplete,
  onStartExam,
}: GroupProgressProps) {
  // 4칸 슬롯: 채워진 칸 + 다음 추가될 칸(현재) + 빈 칸
  const nextPosition = verses.length; // 0-based, 다음에 채워질 자리

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-gray-900">{groupIndex}묶음 진행 중</h3>
        <span className="text-xs text-gray-400">
          {verses.length}/{GROUP_SIZE}
        </span>
      </div>

      <div className="flex gap-2">
        {Array.from({ length: GROUP_SIZE }).map((_, i) => {
          const verse = verses[i];
          const isFilled = !!verse;
          const isCurrent = !isFilled && i === nextPosition && !isComplete;

          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                  isFilled
                    ? 'bg-bible-primary text-white'
                    : isCurrent
                      ? 'animate-pulse-ring border-2 border-bible-accent text-bible-accent'
                      : 'border-2 border-dashed border-gray-300 text-gray-300'
                }`}
              >
                {isFilled ? '✓' : i + 1}
              </div>
              <span
                className={`text-center text-[10px] leading-tight ${
                  isFilled ? 'text-gray-600' : 'text-gray-300'
                }`}
              >
                {isFilled ? `${verse.book} ${verse.chapter}:${verse.verseStart}` : '미정'}
              </span>
            </div>
          );
        })}
      </div>

      {isComplete && onStartExam && (
        <button
          onClick={onStartExam}
          className="mt-4 w-full rounded-xl bg-bible-accent px-6 py-3 font-semibold text-white transition-active"
        >
          🎓 {groupIndex}묶음 시험 보기
        </button>
      )}
    </section>
  );
}
