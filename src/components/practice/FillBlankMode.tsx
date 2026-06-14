import { useMemo, useState } from 'react';
import type { Verse } from '../../types';
import { generateBlanks } from '../../services/scoring';
import { verseRef } from '../../services/verseLabel';

interface FillBlankModeProps {
  verse: Verse;
  onComplete?: (selfCorrect: number, total: number) => void;
}

type Reveal = 'hidden' | 'hint' | 'shown';

export function FillBlankMode({ verse, onComplete }: FillBlankModeProps) {
  // 세션마다 다른 블랭크 (마운트 시점 시드)
  const [seed, setSeed] = useState(() => Date.now());
  const { words, blanks } = useMemo(
    () => generateBlanks(verse.text, 0.4, seed),
    [verse.text, seed],
  );

  // 블랭크 인덱스별 공개 상태
  const [reveals, setReveals] = useState<Record<number, Reveal>>({});
  // 사용자가 정답을 보기 전(=hint 단계에서) 스스로 맞췄다고 표시한 단어
  const [selfCorrect, setSelfCorrect] = useState<Set<number>>(new Set());
  const [done, setDone] = useState(false);

  const cycle = (i: number) => {
    setReveals((prev) => {
      const cur = prev[i] ?? 'hidden';
      const next: Reveal = cur === 'hidden' ? 'hint' : 'shown';
      return { ...prev, [i]: next };
    });
  };

  const toggleSelf = (i: number) => {
    setSelfCorrect((prev) => {
      const n = new Set(prev);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  };

  const reset = () => {
    setSeed(Date.now());
    setReveals({});
    setSelfCorrect(new Set());
    setDone(false);
  };

  const blankCount = blanks.size;
  const handleComplete = () => {
    setDone(true);
    onComplete?.(selfCorrect.size, blankCount);
  };

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-bold text-bible-primary">{verseRef(verse)}</h3>

      <p className="font-serif text-lg leading-loose text-gray-800">
        {words.map((word, i) => {
          if (!blanks.has(i)) return <span key={i}>{word} </span>;
          const state = reveals[i] ?? 'hidden';
          const isSelf = selfCorrect.has(i);

          if (state === 'shown') {
            return (
              <button
                key={i}
                onClick={() => toggleSelf(i)}
                className={`mx-0.5 rounded px-1 underline decoration-dashed underline-offset-4 ${
                  isSelf ? 'bg-bible-primary/15 text-bible-primary' : 'text-gray-800'
                }`}
                title="스스로 맞췄으면 눌러 표시"
              >
                {word}
              </button>
            );
          }
          return (
            <button
              key={i}
              onClick={() => cycle(i)}
              className="mx-0.5 inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 font-mono text-base text-gray-500 transition-active active:scale-95"
            >
              {state === 'hint' ? `${word[0]}…` : '_____'}
            </button>
          );
        })}
      </p>

      <p className="rounded-xl bg-bible-primary/5 px-4 py-2.5 text-xs text-gray-500">
        빈칸을 눌러 떠올려 보세요 · 한 번 누르면 첫 글자 힌트, 다시 누르면 정답이 공개돼요.
        정답을 본 단어 중 스스로 맞춘 것을 눌러 표시하세요.
      </p>

      {!done ? (
        <button onClick={handleComplete} className="btn-primary w-full">
          완료하고 결과 보기
        </button>
      ) : (
        <div className="space-y-3">
          <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
            <p className="text-sm text-gray-500">빈칸 {blankCount}개 중</p>
            <p className="mt-1 text-3xl font-bold text-bible-primary">
              {selfCorrect.size}개 스스로 맞췄어요!
            </p>
          </div>
          <button onClick={reset} className="btn-secondary w-full">
            다른 빈칸으로 다시 하기
          </button>
        </div>
      )}
    </div>
  );
}
