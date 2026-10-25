// 업데이트 후 처음 앱을 열 때 새로워진 점을 한 번 안내하는 팝업
import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { useBibleStore } from '../../store/useBibleStore';
import { RELEASE_NOTES, CURRENT_VERSION } from '../../data/releaseNotes';

const SEEN_KEY = 'bible-memo-seen-version';

function readSeen(): string | null {
  try {
    return localStorage.getItem(SEEN_KEY);
  } catch {
    return null;
  }
}

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, CURRENT_VERSION);
  } catch {
    /* 저장 불가 환경이면 다음에 다시 보일 뿐 */
  }
}

/** 마지막으로 본 버전 이후의 안내만 모은다. 모르는 버전이면 최신 것만. */
function notesSince(seen: string | null) {
  const idx = seen ? RELEASE_NOTES.findIndex((n) => n.version === seen) : -1;
  return idx > 0 ? RELEASE_NOTES.slice(0, idx) : RELEASE_NOTES.slice(0, 1);
}

export function UpdateNotice() {
  const hasData = useBibleStore((s) => s.verses.length > 0);
  const [seen] = useState(readSeen);
  // 처음 쓰는 분(기록 없음)에게는 업데이트 안내가 필요 없다
  const isNewUser = seen === null && !hasData;
  const [open, setOpen] = useState(() => seen !== CURRENT_VERSION && !isNewUser);

  useEffect(() => {
    if (isNewUser) markSeen();
  }, [isNewUser]);

  const close = () => {
    markSeen();
    setOpen(false);
  };

  if (!open) return null;

  const notes = notesSince(seen);

  return (
    <Modal open onClose={close} title="🎉 새로워진 점 안내">
      <div className="space-y-5">
        {notes.map((note) => (
          <div key={note.version}>
            <p className="mb-2 text-xs text-gray-400">{note.date} 업데이트</p>
            <ul className="space-y-2.5">
              {note.items.map((item) => (
                <li
                  key={item.text}
                  className="flex gap-3 rounded-xl bg-bible-primary/5 px-4 py-3 text-base leading-relaxed text-gray-800"
                >
                  <span className="shrink-0 text-xl leading-snug">{item.icon}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <button onClick={close} className="btn-primary w-full text-base">
          확인했어요
        </button>
        <a
          href={`${import.meta.env.BASE_URL}guide.html`}
          onClick={markSeen}
          className="block text-center text-sm font-medium text-bible-primary"
        >
          📖 자세한 사용법 보기
        </a>
      </div>
    </Modal>
  );
}
