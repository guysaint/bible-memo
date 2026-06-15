import type { AppState } from '../types';

const STORAGE_KEY = 'bible-memo-state-v1';

export const emptyState: AppState = {
  verses: [],
  sessions: [],
  exams: [],
};

/** localStorage에서 앱 상태 복원. 손상/부재 시 빈 상태 반환. */
export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...emptyState };
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      verses: parsed.verses ?? [],
      sessions: parsed.sessions ?? [],
      exams: parsed.exams ?? [],
    };
  } catch (err) {
    console.warn('[storage] 상태 복원 실패, 빈 상태로 시작합니다.', err);
    return { ...emptyState };
  }
}

/** 앱 상태를 localStorage에 저장. */
export function saveState(state: AppState): void {
  try {
    const payload: AppState = {
      verses: state.verses,
      sessions: state.sessions,
      exams: state.exams,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error('[storage] 상태 저장 실패', err);
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('[storage] 상태 삭제 실패', err);
  }
}

interface BackupFile {
  app: 'bible-memo';
  version: 1;
  exportedAt: string;
  state: AppState;
}

/** 현재 기록(구절·연습·시험)을 백업 JSON 문자열로 내보낸다. 성경 본문은 제외. */
export function exportBackupJson(): string {
  const backup: BackupFile = {
    app: 'bible-memo',
    version: 1,
    exportedAt: new Date().toISOString(),
    state: loadState(),
  };
  return JSON.stringify(backup, null, 2);
}

/** 백업 JSON을 검증해 복원한다. 성공 시 true(호출 측에서 새로고침). */
export function importBackupJson(json: string): boolean {
  try {
    const parsed = JSON.parse(json) as Partial<BackupFile> & Partial<AppState>;
    // 백업 파일 형식 또는 상태 자체(state) 모두 허용
    const state = (parsed.state ?? parsed) as Partial<AppState>;
    if (!Array.isArray(state.verses)) return false;
    saveState({
      verses: state.verses,
      sessions: Array.isArray(state.sessions) ? state.sessions : [],
      exams: Array.isArray(state.exams) ? state.exams : [],
    });
    return true;
  } catch (err) {
    console.error('[storage] 백업 복원 실패', err);
    return false;
  }
}
