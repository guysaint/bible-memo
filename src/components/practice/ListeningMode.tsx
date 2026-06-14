import { useEffect, useRef, useState } from 'react';
import type { Verse } from '../../types';
import { useTTS } from '../../hooks/useTTS';
import { verseRef } from '../../services/verseLabel';

interface ListeningModeProps {
  verse: Verse;
}

export function ListeningMode({ verse }: ListeningModeProps) {
  const { isSpeaking, isSupported, speak, stop } = useTTS();
  const [rate, setRate] = useState(1.0);
  const [repeat, setRepeat] = useState(1);
  const [revealed, setRevealed] = useState(false);
  const [playedOnce, setPlayedOnce] = useState(false);

  const remainingRef = useRef(0);
  const rateRef = useRef(rate);
  rateRef.current = rate;

  useEffect(() => () => stop(), [stop]);

  const playOnce = () => {
    speak(verse.text, {
      rate: rateRef.current,
      onEnd: () => {
        remainingRef.current -= 1;
        if (remainingRef.current > 0) {
          // 다음 반복
          window.setTimeout(playOnce, 400);
        }
      },
    });
  };

  const handlePlay = () => {
    setRevealed(false);
    setPlayedOnce(true);
    remainingRef.current = repeat;
    playOnce();
  };

  const handleStop = () => {
    remainingRef.current = 0;
    stop();
  };

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-bold text-bible-primary">{verseRef(verse)}</h3>

      {/* 블러 본문 */}
      <div className="relative rounded-2xl bg-white p-5 shadow-sm">
        <p
          className={`whitespace-pre-wrap font-serif text-lg leading-loose text-gray-800 transition ${
            revealed ? '' : 'select-none blur-sm'
          }`}
          aria-hidden={!revealed}
        >
          {revealed ? verse.text : verse.text.replace(/\S/g, '*')}
        </p>
        {!revealed && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="rounded-full bg-black/5 px-4 py-1.5 text-sm text-gray-500">
              {isSpeaking ? '🎧 듣는 중…' : '준비되면 재생 버튼을 누르세요'}
            </span>
          </div>
        )}
      </div>

      {!isSupported && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-700">
          이 브라우저는 음성 재생을 지원하지 않아요.
        </p>
      )}

      {/* 반복 횟수 + 속도 */}
      <div className="flex items-end gap-3">
        <div className="w-28">
          <label className="mb-1 block text-xs text-gray-500">반복 횟수</label>
          <select
            value={repeat}
            onChange={(e) => setRepeat(parseInt(e.target.value, 10))}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-bible-primary"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}회
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
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
      </div>

      {/* 컨트롤 */}
      <div className="flex gap-2">
        {!isSpeaking ? (
          <button onClick={handlePlay} disabled={!isSupported} className="btn-primary flex-1">
            ▶ 재생 ({repeat}회)
          </button>
        ) : (
          <button onClick={handleStop} className="btn-secondary flex-1">
            ⏹ 정지
          </button>
        )}
        <button
          onClick={() => setRevealed((p) => !p)}
          disabled={!playedOnce && !revealed}
          className="btn-secondary flex-1"
        >
          {revealed ? '본문 가리기' : '본문 확인'}
        </button>
      </div>
    </div>
  );
}
