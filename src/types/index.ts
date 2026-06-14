export type SessionMode = 'reading' | 'fillBlank' | 'typing' | 'listening';

export interface Verse {
  id: string; // nanoid
  book: string; // 예: "창세기"
  chapter: number;
  verseStart: number;
  verseEnd?: number; // 범위 절인 경우
  text: string; // 개역개정 본문
  addedDate: string; // ISO string
  weekNumber: number; // 1부터 시작
  groupIndex: number; // 묶음 번호 (1부터)
  positionInGroup: number; // 묶음 내 순서 (1~4)
  isMastered: boolean;
}

export interface MemorizationSession {
  id: string;
  verseId: string;
  sessionDate: string;
  mode: SessionMode;
  score?: number; // 0~100, 채점 모드만
  durationSeconds: number;
}

export interface GroupExam {
  id: string;
  groupIndex: number;
  examDate: string;
  verseIds: string[]; // 4개
  scores: Record<string, number>; // verseId → score
  isPassed: boolean; // 평균 80점 이상
}

export interface AppState {
  verses: Verse[];
  sessions: MemorizationSession[];
  exams: GroupExam[];
}

/** 한 묶음을 채우는 구절 수 */
export const GROUP_SIZE = 4;
/** 묶음 시험 합격 기준 평균 점수 */
export const EXAM_PASS_SCORE = 80;
