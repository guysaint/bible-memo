import type { SessionMode } from '../../types';

export interface ModeMeta {
  mode: SessionMode;
  icon: string;
  label: string;
  description: string;
}

export const MODE_LIST: ModeMeta[] = [
  {
    mode: 'reading',
    icon: '👀',
    label: '보면서 읽기',
    description: '본문을 보며 소리 내어 따라 읽어요',
  },
  {
    mode: 'fillBlank',
    icon: '✏️',
    label: '단어 채우기',
    description: '빈칸을 떠올리며 암송을 점검해요',
  },
  {
    mode: 'typing',
    icon: '⌨️',
    label: '직접 입력',
    description: '기억만으로 본문을 입력하고 채점받아요',
  },
  {
    mode: 'listening',
    icon: '🎧',
    label: '듣기 모드',
    description: '본문을 가린 채 들으며 외워요',
  },
];

export const MODE_MAP: Record<SessionMode, ModeMeta> = Object.fromEntries(
  MODE_LIST.map((m) => [m.mode, m]),
) as Record<SessionMode, ModeMeta>;
