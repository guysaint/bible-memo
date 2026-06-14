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
