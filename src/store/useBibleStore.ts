import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type {
  AppState,
  GroupExam,
  MemorizationSession,
  Verse,
} from '../types';
import { GROUP_SIZE, EXAM_PASS_SCORE } from '../types';
import { loadState, saveState } from '../services/storage';

/** 구절 추가 시 주차/묶음/순서 자동 계산 */
export function calculateMeta(existingCount: number) {
  return {
    weekNumber: existingCount + 1,
    groupIndex: Math.floor(existingCount / GROUP_SIZE) + 1,
    positionInGroup: (existingCount % GROUP_SIZE) + 1,
  };
}

export type AddVerseInput = Omit<
  Verse,
  | 'id'
  | 'addedDate'
  | 'weekNumber'
  | 'groupIndex'
  | 'positionInGroup'
  | 'isMastered'
>;

export interface AppStats {
  totalVerses: number;
  totalSessions: number;
  streak: number;
  passRate: number; // 0~100
}

/** 사용자가 수정 가능한 구절 필드 */
export type EditVerseInput = Pick<
  Verse,
  'book' | 'chapter' | 'verseStart' | 'verseEnd' | 'text'
>;

interface BibleStore extends AppState {
  addVerse: (input: AddVerseInput) => Verse;
  addSession: (session: Omit<MemorizationSession, 'id'>) => void;
  addExam: (exam: Omit<GroupExam, 'id'>) => void;
  markMastered: (verseId: string) => void;
  updateVerse: (verseId: string, patch: EditVerseInput) => void;

  // 셀렉터
  getGroupVerses: (groupIndex: number) => Verse[];
  getCurrentGroup: () => {
    groupIndex: number;
    verses: Verse[];
    isComplete: boolean;
  };
  getStats: () => AppStats;
}

const initial = loadState();

export const useBibleStore = create<BibleStore>((set, get) => ({
  verses: initial.verses,
  sessions: initial.sessions,
  exams: initial.exams,

  addVerse: (input) => {
    const meta = calculateMeta(get().verses.length);
    const verse: Verse = {
      ...input,
      ...meta,
      id: nanoid(),
      addedDate: new Date().toISOString(),
      isMastered: false,
    };
    set((s) => {
      const next = { ...s, verses: [...s.verses, verse] };
      persist(next);
      return next;
    });
    return verse;
  },

  addSession: (session) => {
    const full: MemorizationSession = { ...session, id: nanoid() };
    set((s) => {
      const next = { ...s, sessions: [...s.sessions, full] };
      persist(next);
      return next;
    });
  },

  addExam: (exam) => {
    const full: GroupExam = { ...exam, id: nanoid() };
    set((s) => {
      const next = { ...s, exams: [...s.exams, full] };
      persist(next);
      return next;
    });
  },

  updateVerse: (verseId, patch) => {
    set((s) => {
      const next = {
        ...s,
        verses: s.verses.map((v) =>
          v.id === verseId
            ? {
                ...v,
                book: patch.book,
                chapter: patch.chapter,
                verseStart: patch.verseStart,
                verseEnd: patch.verseEnd,
                text: patch.text,
              }
            : v,
        ),
      };
      persist(next);
      return next;
    });
  },

  markMastered: (verseId) => {
    set((s) => {
      const next = {
        ...s,
        verses: s.verses.map((v) =>
          v.id === verseId ? { ...v, isMastered: true } : v,
        ),
      };
      persist(next);
      return next;
    });
  },

  getGroupVerses: (groupIndex) =>
    get()
      .verses.filter((v) => v.groupIndex === groupIndex)
      .sort((a, b) => a.positionInGroup - b.positionInGroup),

  getCurrentGroup: () => {
    const verses = get().verses;
    const groupIndex =
      verses.length === 0
        ? 1
        : Math.max(...verses.map((v) => v.groupIndex));
    const groupVerses = get().getGroupVerses(groupIndex);
    return {
      groupIndex,
      verses: groupVerses,
      isComplete: groupVerses.length >= GROUP_SIZE,
    };
  },

  getStats: () => {
    const { verses, sessions, exams } = get();
    const passedExams = exams.filter((e) => e.isPassed).length;
    return {
      totalVerses: verses.length,
      totalSessions: sessions.length,
      streak: computeStreak(sessions),
      passRate:
        exams.length === 0
          ? 0
          : Math.round((passedExams / exams.length) * 100),
    };
  },
}));

function persist(state: AppState) {
  saveState({
    verses: state.verses,
    sessions: state.sessions,
    exams: state.exams,
  });
}

/** 연속 연습 일수(streak): 오늘 또는 어제부터 거꾸로 연속된 날 수 (KST) */
function computeStreak(sessions: MemorizationSession[]): number {
  if (sessions.length === 0) return 0;

  const days = new Set(
    sessions.map((s) => kstDateKey(new Date(s.sessionDate))),
  );

  let streak = 0;
  const cursor = new Date();
  // 오늘 기록이 없으면 어제부터 셈
  if (!days.has(kstDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(kstDateKey(cursor))) return 0;
  }
  while (days.has(kstDateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** KST 기준 YYYY-MM-DD 키 */
function kstDateKey(d: Date): string {
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

export { EXAM_PASS_SCORE };
