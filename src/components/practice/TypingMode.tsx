import { useRef, useState } from 'react';
import type { Verse } from '../../types';
import { scoreText, type WordResult } from '../../services/scoring';
import { verseRef } from '../../services/verseLabel';
import { ScoreResult } from './ScoreResult';

interface TypingModeProps {
  verse: Verse;
  /** 채점 완료 시 점수 보고 (세션 기록용) */
  onScored?: (score: number) => void;
  /** 다음 구절 이동 (없으면 버튼 숨김) */
  onNext?: () => void;
}

export function TypingMode({ verse, onScored, onNext }: TypingModeProps) {
  // 한글 IME 조합 입력 문제를 피하려고 제출 시 DOM 값을 직접 읽는다.
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [hasText, setHasText] = useState(false);
  const [result, setResult] = useState<{ score: number; results: WordResult[] } | null>(null);

  const handleScore = () => {
    const text = taRef.current?.value ?? '';
    if (text.trim().length === 0) return;
    const r = scoreText(text, verse.text);
    setResult(r);
    onScored?.(r.score);
  };

  const retry = () => {
    setResult(null);
    setHasText(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-bible-primary">{verseRef(verse)}</h3>
        <p className="mt-1 text-xs text-gray-400">본문은 가려져 있어요. 기억나는 대로 입력해 보세요.</p>
      </div>

      {!result ? (
        <>
          <textarea
            ref={taRef}
            defaultValue=""
            onChange={(e) => setHasText(e.target.value.trim().length > 0)}
            rows={8}
            autoFocus
            placeholder="외운 본문을 입력하세요…"
            className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-3 font-serif text-base leading-relaxed text-gray-800 outline-none focus:border-bible-primary"
          />
          <button
            onClick={handleScore}
            disabled={!hasText}
            className="btn-primary w-full"
          >
            채점하기
          </button>
        </>
      ) : (
        <>
          <ScoreResult score={result.score} results={result.results} />
          <div className="flex gap-2">
            <button onClick={retry} className="btn-secondary flex-1">
              다시 도전
            </button>
            {onNext && (
              <button onClick={onNext} className="btn-primary flex-1">
                다음 구절
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
