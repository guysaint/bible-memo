import type { ReactNode } from 'react';
import type { Verse } from '../../types';
import { verseRef } from '../../services/verseLabel';

interface VerseCardProps {
  verse: Verse;
  /** 하단 액션 영역 (버튼 등) */
  footer?: ReactNode;
  /** 본문 숨김 (듣기 모드 등) */
  hideText?: boolean;
  className?: string;
}

export function VerseCard({ verse, footer, hideText = false, className = '' }: VerseCardProps) {
  return (
    <article
      className={`rounded-2xl border-l-4 border-bible-primary bg-white p-5 shadow-sm ${className}`}
    >
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-bold tracking-wide text-bible-primary">
          {verseRef(verse)}
        </h3>
        {verse.isMastered && (
          <span className="rounded-full bg-bible-primary/10 px-2 py-0.5 text-[11px] font-semibold text-bible-primary">
            ✓ 마스터
          </span>
        )}
      </div>
      {!hideText && (
        <p className="mt-3 whitespace-pre-wrap font-serif text-lg leading-relaxed text-gray-800">
          {verse.text}
        </p>
      )}
      {footer && <div className="mt-4">{footer}</div>}
    </article>
  );
}
