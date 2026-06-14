import type { Verse } from '../types';

/** "창세기 1:1" 또는 범위 "창세기 1:1-3" */
export function verseRef(v: Pick<Verse, 'book' | 'chapter' | 'verseStart' | 'verseEnd'>): string {
  const range =
    v.verseEnd && v.verseEnd > v.verseStart
      ? `${v.verseStart}-${v.verseEnd}`
      : `${v.verseStart}`;
  return `${v.book} ${v.chapter}:${range}`;
}
