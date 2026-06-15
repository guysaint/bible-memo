// 사용자가 가져온 성경 본문을 기기(IndexedDB)에만 저장하고 조회하는 서비스
// 공개 사이트·저장소에는 본문이 포함되지 않는다. 개인·교회 사용 범위에서만 로컬에 보관.
import { ALL_BOOKS } from '../data/bibleBooks';

export interface VerseRow {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

// 대한성서공회 표준 책 약자(정경 순서). ALL_BOOKS와 1:1 대응.
const BOOK_ABBR = [
  '창', '출', '레', '민', '신', '수', '삿', '룻', '삼상', '삼하',
  '왕상', '왕하', '대상', '대하', '스', '느', '에', '욥', '시', '잠',
  '전', '아', '사', '렘', '애', '겔', '단', '호', '욜', '암',
  '옵', '욘', '미', '나', '합', '습', '학', '슥', '말',
  '마', '막', '눅', '요', '행', '롬', '고전', '고후', '갈', '엡',
  '빌', '골', '살전', '살후', '딤전', '딤후', '딛', '몬', '히', '약',
  '벧전', '벧후', '요일', '요이', '요삼', '유', '계',
];

// 약자 → 앱의 전체 책 이름. 약자가 전체 이름과 1:1로 맞지 않으면 비어 있게 둔다.
const abbrToName: Record<string, string> = {};
if (BOOK_ABBR.length === ALL_BOOKS.length) {
  BOOK_ABBR.forEach((a, i) => {
    abbrToName[a] = ALL_BOOKS[i].name;
  });
}

const DB_NAME = 'bible-memo-text';
const STORE = 'verses';
const DB_VERSION = 1;

function key(book: string, chapter: number, verse: number): string {
  return `${book}|${chapter}|${verse}`;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** 본문 행들을 일괄 저장(덮어쓰기). 저장된 개수 반환. */
export async function importVerses(rows: VerseRow[]): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    for (const r of rows) {
      store.put({ id: key(r.book, r.chapter, r.verse), ...r });
    }
    tx.oncomplete = () => {
      db.close();
      resolve(rows.length);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

/** 인터넷 주소(URL)에서 본문 파일을 받아 가져온다. 저장된 개수 반환. */
export async function importFromUrl(url: string): Promise<number> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`다운로드 실패 (HTTP ${res.status})`);
  const content = await res.text();
  const name = url.split(/[?#]/)[0];
  const rows = parseVerseFile(name, content);
  if (rows.length === 0) throw new Error('가져올 본문을 찾지 못했어요');
  return importVerses(rows);
}

/** 해당 구절(범위 포함) 본문을 한 문자열로. 없으면 null. */
export async function getVerseText(
  book: string,
  chapter: number,
  verseStart: number,
  verseEnd?: number,
): Promise<string | null> {
  const end = verseEnd && verseEnd >= verseStart ? verseEnd : verseStart;
  const db = await openDB();
  try {
    const store = db.transaction(STORE, 'readonly').objectStore(STORE);
    const parts: string[] = [];
    for (let v = verseStart; v <= end; v++) {
      const row = await getOne(store, key(book, chapter, v));
      if (row?.text) parts.push(row.text.trim());
    }
    return parts.length > 0 ? parts.join(' ') : null;
  } finally {
    db.close();
  }
}

function getOne(store: IDBObjectStore, id: string): Promise<VerseRow | undefined> {
  return new Promise((resolve, reject) => {
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result as VerseRow | undefined);
    req.onerror = () => reject(req.error);
  });
}

/** 저장된 본문 구절 수. */
export async function countVerses(): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).count();
    req.onsuccess = () => {
      db.close();
      resolve(req.result);
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

/** 저장된 본문 전체 삭제. */
export async function clearVerses(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

/**
 * 가져온 파일 내용을 VerseRow[]로 파싱한다.
 * - JSON: [{book,chapter,verse,text}] 또는 {verses:[...]}
 * - 구분자(탭/쉼표): 각 줄 book,chapter,verse,text (text는 나머지 전체)
 * 잘못된 행은 건너뛴다.
 */
export function parseVerseFile(filename: string, content: string): VerseRow[] {
  const trimmed = content.trim();
  const looksJson =
    filename.toLowerCase().endsWith('.json') ||
    trimmed.startsWith('[') ||
    trimmed.startsWith('{');

  const raw: unknown[] = looksJson ? parseJson(trimmed) : parseDelimited(trimmed);
  const rows: VerseRow[] = [];
  for (const item of raw) {
    const row = normalizeRow(item);
    if (row) rows.push(row);
  }
  return rows;
}

function parseJson(text: string): unknown[] {
  const data = JSON.parse(text);
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    if (Array.isArray((data as { verses?: unknown[] }).verses)) {
      return (data as { verses: unknown[] }).verses;
    }
    // 맵 형식: { "창1:1": "본문", "요3:16": "본문", ... }
    return parseVerseMap(data as Record<string, unknown>);
  }
  return [];
}

// "창1:1" / "신6:18-19" 키를 약자·장·절로 풀어 전체 책 이름으로 매핑한다.
const KEY_RE = /^(\D+?)(\d+):(\d+)(?:-\d+)?$/;
function parseVerseMap(map: Record<string, unknown>): unknown[] {
  const out: unknown[] = [];
  for (const [k, value] of Object.entries(map)) {
    const m = KEY_RE.exec(k.trim());
    if (!m) continue;
    const book = abbrToName[m[1]];
    if (!book) continue; // 모르는 약자는 건너뛴다
    out.push({ book, chapter: m[2], verse: m[3], text: value });
  }
  return out;
}

function parseDelimited(text: string): unknown[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  const delimiter = lines[0]?.includes('\t') ? '\t' : ',';
  const out: unknown[] = [];
  for (const line of lines) {
    const cols = splitWithLimit(line, delimiter, 3);
    if (cols.length < 4) continue;
    // 헤더 행(장이 숫자가 아니면) 건너뛰기
    if (!/^\d+$/.test(cols[1].trim())) continue;
    out.push({ book: cols[0], chapter: cols[1], verse: cols[2], text: cols[3] });
  }
  return out;
}

/** 앞에서 limit번만 구분자로 자르고 나머지는 한 덩어리로(본문 속 구분자 보존). */
function splitWithLimit(line: string, delimiter: string, limit: number): string[] {
  const parts: string[] = [];
  let rest = line;
  for (let i = 0; i < limit; i++) {
    const idx = rest.indexOf(delimiter);
    if (idx === -1) {
      parts.push(rest);
      return parts;
    }
    parts.push(rest.slice(0, idx));
    rest = rest.slice(idx + delimiter.length);
  }
  parts.push(rest);
  return parts;
}

function normalizeRow(item: unknown): VerseRow | null {
  if (!item || typeof item !== 'object') return null;
  const o = item as Record<string, unknown>;
  const book = String(o.book ?? '').trim();
  const chapter = Number(o.chapter);
  const verse = Number(o.verse);
  const text = String(o.text ?? '').trim();
  if (!book || !Number.isFinite(chapter) || !Number.isFinite(verse) || !text) return null;
  return { book, chapter, verse, text };
}
