// 구절 상세 보기 + 수정(책·장·절·본문) 모달
import { useEffect, useRef, useState } from 'react';
import type { MemorizationSession, Verse } from '../../types';
import { Modal } from '../ui/Modal';
import { Stepper } from '../ui/Stepper';
import { MODE_MAP } from '../practice/modeMeta';
import { OLD_TESTAMENT, NEW_TESTAMENT, findBook } from '../../data/bibleBooks';
import { useBibleStore } from '../../store/useBibleStore';
import { useToast } from '../ui/Toast';
import { verseRef } from '../../services/verseLabel';
import { formatDateTime } from '../../services/datetime';

interface VerseDetailModalProps {
  verse: Verse | null;
  sessions: MemorizationSession[];
  onClose: () => void;
}

export function VerseDetailModal({ verse, sessions, onClose }: VerseDetailModalProps) {
  const updateVerse = useBibleStore((s) => s.updateVerse);
  const { showToast } = useToast();

  const [editing, setEditing] = useState(false);
  const [book, setBook] = useState('');
  const [chapter, setChapter] = useState(1);
  const [verseStart, setVerseStart] = useState(1);
  const [useRange, setUseRange] = useState(false);
  const [verseEnd, setVerseEnd] = useState(2);
  const textRef = useRef<HTMLTextAreaElement>(null);

  // 다른 구절을 열거나 닫으면 수정 모드 해제
  useEffect(() => {
    setEditing(false);
  }, [verse?.id]);

  if (!verse) return null;

  const history = sessions
    .filter((s) => s.verseId === verse.id)
    .sort((a, b) => +new Date(b.sessionDate) - +new Date(a.sessionDate));

  const startEdit = () => {
    setBook(verse.book);
    setChapter(verse.chapter);
    setVerseStart(verse.verseStart);
    setUseRange(verse.verseEnd != null && verse.verseEnd > verse.verseStart);
    setVerseEnd(verse.verseEnd ?? verse.verseStart + 1);
    setEditing(true);
  };

  const handleSave = () => {
    const text = textRef.current?.value.trim() ?? '';
    if (!book || text.length === 0) {
      showToast('책과 본문을 확인해 주세요.', 'error');
      return;
    }
    updateVerse(verse.id, {
      book,
      chapter,
      verseStart,
      verseEnd: useRange ? verseEnd : undefined,
      text,
    });
    showToast('구절을 수정했어요.');
    setEditing(false);
  };

  const maxChapter = findBook(book)?.chapters ?? 150;

  return (
    <Modal open onClose={onClose} title={editing ? '구절 수정' : verseRef(verse)}>
      {editing ? (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">책</label>
            <select
              value={book}
              onChange={(e) => setBook(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-base text-gray-800 outline-none focus:border-bible-primary"
            >
              <optgroup label="구약 39권">
                {OLD_TESTAMENT.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="신약 27권">
                {NEW_TESTAMENT.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="flex gap-3">
            <Stepper label="장" value={chapter} onChange={setChapter} min={1} max={maxChapter} />
            <Stepper
              label="절 시작"
              value={verseStart}
              onChange={(v) => {
                setVerseStart(v);
                if (verseEnd < v) setVerseEnd(v + 1);
              }}
              min={1}
              max={200}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
            <span className="text-sm font-medium text-gray-700">범위 절 (여러 절)</span>
            <button
              type="button"
              role="switch"
              aria-checked={useRange}
              onClick={() => setUseRange((p) => !p)}
              className={`relative h-7 w-12 rounded-full transition-colors ${
                useRange ? 'bg-bible-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                  useRange ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {useRange && (
            <div className="flex gap-3">
              <Stepper
                label="절 끝"
                value={verseEnd}
                onChange={setVerseEnd}
                min={verseStart}
                max={200}
              />
              <div className="flex-1" />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">본문</label>
            <textarea
              ref={textRef}
              defaultValue={verse.text}
              rows={6}
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-3 font-serif text-base leading-relaxed text-gray-800 outline-none focus:border-bible-primary"
            />
          </div>

          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="btn-secondary flex-1">
              취소
            </button>
            <button onClick={handleSave} className="btn-primary flex-1">
              저장
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="whitespace-pre-wrap rounded-xl bg-bible-bg p-4 font-serif text-lg leading-relaxed text-gray-800">
            {verse.text}
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs">
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
            <button
              onClick={startEdit}
              className="ml-auto rounded-full border border-bible-primary px-3 py-1 font-medium text-bible-primary"
            >
              ✏ 수정
            </button>
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
