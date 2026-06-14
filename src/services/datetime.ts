/** 모든 날짜 표시는 한국 시간대(KST) 기준 */

const KST = 'Asia/Seoul';

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', {
    timeZone: KST,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', {
    timeZone: KST,
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ko-KR', {
    timeZone: KST,
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** 오늘 KST 기준 "6월 14일 토요일" */
export function todayLabel(): string {
  return new Date().toLocaleDateString('ko-KR', {
    timeZone: KST,
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
}
