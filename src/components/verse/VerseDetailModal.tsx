import type { MemorizationSession, Verse } from '../../types';
import { Modal } from '../ui/Modal';
import { MODE_MAP } from '../practice/modeMeta';
import { verseRef } from '../../services/verseLabel';
import { formatDateTime } from '../../services/datetime';

interface VerseDetailModalProps {
  verse: Verse | null;
  sessions: MemorizationSession[];
  onClose: () => void;
}

export function VerseDetailModal({ verse, sessions, onClose }: VerseDetailModalProps) {
  const history = verse
    ? sessions
        .filter((s) => s.verseId === verse.id)
        .sort((a, b) => +new Date(b.sessionDate) - +new Date(a.sessionDate))
    : [];

  return (
    <Modal open={!!verse} onClose={onClose} title={verse ? verseRef(verse) : ''}>
      {verse && (
        <div className="space-y-4">
          <p className="whitespace-pre-wrap rounded-xl bg-bible-bg p-4 font-serif text-lg leading-relaxed text-gray-800">
            {verse.text}
          </p>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">
              {verse.weekNumber}주차
            </span>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">
              {verse.groupIndex}묶음 {verse.positionInGroup}번
            </span>
            {verse.isMastered && (
              <span className="rounded-full bg-bible-primary/10 px-2.5 py-1 font-semibold text-bible-primary">
                ✓ 마스터
              </span>
            )}
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-600">연습 이력</h4>
            {history.length === 0 ? (
              <p className="text-sm text-gray-400">아직 연습 기록이 없어요.</p>
            ) : (
              <ul className="max-h-56 space-y-1.5 overflow-y-auto">
                {history.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm"
                  >
                    <span>{MODE_MAP[s.mode].icon}</span>
                    <span className="text-gray-700">{MODE_MAP[s.mode].label}</span>
                    <span className="ml-auto text-xs text-gray-400">
                      {formatDateTime(s.sessionDate)}
                    </span>
                    {typeof s.score === 'number' && (
                      <span className="font-semibold text-bible-primary">{s.score}점</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
