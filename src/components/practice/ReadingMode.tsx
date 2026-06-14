import { useEffect, useRef, useState } from 'react';
import type { Verse } from '../../types';
import { useTTS } from '../../hooks/useTTS';
import { verseRef } from '../../services/verseLabel';

interface ReadingModeProps {
  verse: Verse;
}

export function ReadingMode({ verse }: ReadingModeProps) {
  const { isSpeaking, isPaused, charIndex, isSupported, speak, stop, pause, resume } = useTTS();
  const [rate, setRate] = useState(1.0);
  const rateRef = useRef(rate);
  rateRef.current = rate;

  // 모드 전환/언마운트 시 정지
  useEffect(() => () => stop(), [stop]);

  const handlePlay = () => {
    speak(verse.text, { rate: rateRef.current });
  };

  // 현재 읽는 단어 하이라이트: charIndex 위치가 포함된 단어 범위 계산
  const highlight = computeHighlight(verse.text, isSpeaking ? charIndex : null);

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-bold text-bible-primary">{verseRef(verse)}</h3>

      <p className="whitespace-pre-wrap font-serif text-xl leading-loose text-gray-800">
        {highlight ? (
          <>
            {verse.text.slice(0, highlight.start)}
            <mark className="rounded bg-yellow-200 px-0.5 text-gray-900">
              {verse.text.slice(highlight.start, highlight.end)}
            </mark>
            {verse.text.slice(highlight.end)}
          </>
        ) : (
          verse.text
        )}
      </p>

      {!isSupported && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-700">
          이 브라우저는 음성 읽기를 지원하지 않아요. 본문을 보며 직접 읽어보세요.
        </p>
      )}

      {/* 속도 슬라이더 */}
      <div>
        <div className="mb-1 flex justify-between text-xs text-gray-500">
          <span>재생 속도</span>
          <span>{rate.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min={0.5}
          max={1.5}
          step={0.1}
          value={rate}
          onChange={(e) => setRate(parseFloat(e.target.value))}
          className="w-full accent-bible-primary"
          aria-label="재생 속도"
        />
      </div>

      {/* 컨트롤 */}
      <div className="flex gap-2">
        {!isSpeaking ? (
          <button onClick={handlePlay} disabled={!isSupported} className="btn-primary flex-1">
            ▶ 읽어주기
          </button>
        ) : (
          <>
            {isPaused ? (
              <button onClick={resume} className="btn-primary flex-1">
                ▶ 이어서
              </button>
            ) : (
              <button onClick={pause} className="btn-secondary flex-1">
                ⏸ 일시정지
              </button>
            )}
            <button onClick={stop} className="btn-secondary flex-1">
              ⏹ 정지
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/** charIndex가 가리키는 단어의 [start, end) 범위를 본문 기준으로 계산 */
function computeHighlight(
  text: string,
  charIndex: number | null,
): { start: number; end: number } | null {
  if (charIndex === null || charIndex < 0 || charIndex >= text.length) return null;
  // 공백이면 하이라이트 생략
  if (/\s/.test(text[charIndex])) return null;
  let start = charIndex;
  while (start > 0 && !/\s/.test(text[start - 1])) start--;
  let end = charIndex;
  while (end < text.length && !/\s/.test(text[end])) end++;
  return { start, end };
}
