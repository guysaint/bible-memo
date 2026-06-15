// 묶음 진행 현황 카드 — 묶음 전환, 구절 선택, 빈 칸으로 추가 이동을 담당
import type { Verse } from '../../types';
import { GROUP_SIZE } from '../../types';

interface GroupProgressProps {
  groupIndex: number;
  verses: Verse[];
  isComplete: boolean;
  selectedVerseId?: string;
  onSelectVerse?: (verse: Verse) => void;
  onAddSlot?: () => void;
  onStartExam?: () => void;
  /** 묶음이 2개 이상일 때 전환용 */
  allGroupIndexes?: number[];
  onSelectGroup?: (groupIndex: number) => void;
}

export function GroupProgress({
  groupIndex,
  verses,
  isComplete,
  selectedVerseId,
  onSelectVerse,
  onAddSlot,
  onStartExam,
  allGroupIndexes = [],
  onSelectGroup,
}: GroupProgressProps) {
  // 4칸 슬롯: 채워진 칸 + 다음 추가될 칸(현재) + 빈 칸
  const nextPosition = verses.length; // 0-based, 다음에 채워질 자리
  const showSwitcher = allGroupIndexes.length > 1 && !!onSelectGroup;

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-gray-900">
          {groupIndex}묶음{isComplete ? '' : ' 진행 중'}
        </h3>
        <span className="text-xs text-gray-400">
          {verses.length}/{GROUP_SIZE}
        </span>
      </div>

      {/* 묶음 전환 칩 */}
      {showSwitcher && (
        <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
          {allGroupIndexes.map((gi) => (
            <button
              key={gi}
              onClick={() => onSelectGroup?.(gi)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                gi === groupIndex
                  ? 'bg-bible-primary text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {gi}묶음
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        {Array.from({ length: GROUP_SIZE }).map((_, i) => {
          const verse = verses[i];
          const isFilled = !!verse;
          const isCurrent = !isFilled && i === nextPosition && !isComplete;
          const isSelected = isFilled && verse.id === selectedVerseId;

          const circleClass = isFilled
            ? `bg-bible-primary text-white ${isSelected ? 'ring-2 ring-bible-primary ring-offset-2' : ''}`
            : isCurrent
              ? 'animate-pulse-ring border-2 border-bible-accent text-bible-accent'
              : 'border-2 border-dashed border-gray-300 text-gray-300';

          const labelClass = isFilled
            ? isSelected
              ? 'text-bible-primary font-semibold'
              : 'text-gray-600'
            : isCurrent
              ? 'text-bible-accent'
              : 'text-gray-300';

          const content = (
            <>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${circleClass}`}
              >
                {isFilled ? '✓' : isCurrent ? '＋' : i + 1}
              </div>
              <span className={`text-center text-[10px] leading-tight ${labelClass}`}>
                {isFilled
                  ? `${verse.book} ${verse.chapter}:${verse.verseStart}`
                  : isCurrent
                    ? '추가하기'
                    : '미정'}
              </span>
            </>
          );

          // 채워진 칸 → 구절 선택, 현재 빈 칸 → 추가 이동
          if (isFilled && onSelectVerse) {
            return (
              <button
                key={i}
                onClick={() => onSelectVerse(verse)}
                aria-pressed={isSelected}
                className="flex flex-1 flex-col items-center gap-1.5 transition-active active:scale-95"
              >
                {content}
              </button>
            );
          }
          if (isCurrent && onAddSlot) {
            return (
              <button
                key={i}
                onClick={onAddSlot}
                className="flex flex-1 flex-col items-center gap-1.5 transition-active active:scale-95"
              >
                {content}
              </button>
            );
          }
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              {content}
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
