// 업데이트 안내 팝업에 보여줄 버전별 변경 사항 (최신 버전이 맨 위)
// 새로 배포할 때 맨 위에 항목을 하나 추가하면, 성도님들이 다음에 앱을 열 때 한 번 안내된다.

export interface ReleaseNote {
  version: string;
  date: string;
  items: { icon: string; text: string }[];
}

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: '2026-10-25',
    date: '2026년 10월 25일',
    items: [
      {
        icon: '✏️',
        text: '홈 화면 말씀 카드 오른쪽 위 ‘수정’ 버튼으로 말씀을 바로 고칠 수 있어요.',
      },
      {
        icon: '📖',
        text: '화면 오른쪽 위 ‘사용법’ 버튼을 누르면 그림 설명서를 볼 수 있어요.',
      },
      {
        icon: '🎯',
        text: '연습 화면에서 지난 묶음도 골라서 다시 연습할 수 있어요.',
      },
      {
        icon: '🔧',
        text: '연습 화면이 열리지 않던 문제와 시험 마지막 구절이 0점 나오던 문제를 고쳤어요.',
      },
    ],
  },
];

export const CURRENT_VERSION = RELEASE_NOTES[0].version;
