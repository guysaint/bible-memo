// getbible v2 API로 책/장/절을 받아 성경 본문(개역한글)을 조회하는 서비스
import { ALL_BOOKS } from '../data/bibleBooks';

// 주의: getbible의 'korean'은 개역한글(개역성경)이며 개역개정과는 표현 차이가 있다.
const BASE = 'https://api.getbible.net/v2/korean';

export const TEXT_VERSION_LABEL = '개역한글';

interface GetBibleVerse {
  chapter: number;
  verse: number;
  text: string;
}
interface GetBibleChapter {
  verses: GetBibleVerse[];
}

// 같은 장을 반복 조회하지 않도록 메모리 캐시
const chapterCache = new Map<string, GetBibleVerse[]>();

/** 책 이름 → getbible 책번호(정경 순서 1~66). 못 찾으면 0. */
function bookNumber(book: string): number {
  return ALL_BOOKS.findIndex((b) => b.name === book) + 1;
}

async function fetchChapter(bookNr: number, chapter: number): Promise<GetBibleVerse[]> {
  const key = `${bookNr}/${chapter}`;
  const cached = chapterCache.get(key);
  if (cached) return cached;

  const res = await fetch(`${BASE}/${bookNr}/${chapter}.json`);
  if (!res.ok) throw new Error(`본문 조회 실패 (HTTP ${res.status})`);
  const data = (await res.json()) as GetBibleChapter;
  const verses = data.verses ?? [];
  chapterCache.set(key, verses);
  return verses;
}

/**
 * 해당 구절(범위 포함) 본문을 한 문자열로 반환한다.
 * 절을 못 찾으면 null. 네트워크 오류는 throw.
 */
export async function fetchVerseText(
  book: string,
  chapter: number,
  verseStart: number,
  verseEnd?: number,
): Promise<string | null> {
  const bookNr = bookNumber(book);
  if (bookNr <= 0) return null;

  const verses = await fetchChapter(bookNr, chapter);
  const end = verseEnd && verseEnd >= verseStart ? verseEnd : verseStart;

  const picked = verses
    .filter((v) => v.verse >= verseStart && v.verse <= end)
    .sort((a, b) => a.verse - b.verse)
    .map((v) => v.text.trim());

  if (picked.length === 0) return null;
  return picked.join(' ');
}
