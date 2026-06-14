import { useMemo, useState } from 'react';
import { OLD_TESTAMENT, NEW_TESTAMENT, findBook } from '../data/bibleBooks';
import { Stepper } from '../components/ui/Stepper';
import { useBibleStore, calculateMeta } from '../store/useBibleStore';
import { useToast } from '../components/ui/Toast';
import { useNavigation } from '../hooks/useNavigation';
import { GROUP_SIZE } from '../types';

const ORDINAL = ['', '첫', '두', '세', '네'];

export function AddVerse() {
  const verses = useBibleStore((s) => s.verses);
  const addVerse = useBibleStore((s) => s.addVerse);
  const { showToast } = useToast();
  const { navigate } = useNavigation();

  const [book, setBook] = useState('');
  const [chapter, setChapter] = useState(1);
  const [verseStart, setVerseStart] = useState(1);
  const [useRange, setUseRange] = useState(false);
  const [verseEnd, setVerseEnd] = useState(2);
  const [text, setText] = useState('');

  const maxChapter = useMemo(() => findBook(book)?.chapters ?? 150, [book]);

  // 다음 구절의 주차/묶음/순서 미리보기
  const meta = useMemo(() => calculateMeta(verses.length), [verses.length]);

  const trimmedLen = text.trim().length;
  const isValid =
    book !== '' &&
    chapter >= 1 &&
    verseStart >= 1 &&
    (!useRange || verseEnd >= verseStart) &&
    trimmedLen >= 10;

  const handleSubmit = () => {
    if (!isValid) return;
    addVerse({
      book,
      chapter,
      verseStart,
      verseEnd: useRange ? verseEnd : undefined,
      text: text.trim(),
    });
    showToast(`${book} ${chapter}:${verseStart} 구절을 추가했어요!`);
    // 폼 초기화
    setText('');
    setUseRange(false);
    navigate('home');
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">이번 주 말씀 추가</h2>
        <p className="mt-0.5 text-sm text-gray-500">암송할 한 구절을 등록하세요.</p>
      </div>

      {/* 책 선택 */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">책</label>
        <select
          value={book}
          onChange={(e) => {
            setBook(e.target.value);
            setChapter(1);
          }}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-base text-gray-800 outline-none focus:border-bible-primary"
        >
          <option value="" disabled>
            책을 선택하세요
          </option>
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

      {/* 장 / 절 시작 */}
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

      {/* 범위 절 토글 */}
      <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
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

      {/* 본문 */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-xs font-medium text-gray-500">본문 (개역개정)</label>
          <span
            className={`text-xs ${trimmedLen >= 10 ? 'text-gray-400' : 'text-bible-accent'}`}
          >
            {trimmedLen}자
          </span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="암송할 본문을 입력하세요 (10자 이상)"
          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-3 font-serif text-base leading-relaxed text-gray-800 outline-none focus:border-bible-primary"
        />
      </div>

      {/* 자동 계산 안내 */}
      <div className="space-y-1.5 rounded-xl bg-bible-primary/5 px-4 py-3 text-sm text-gray-700">
        <p>📅 {meta.weekNumber}주차 구절로 추가됩니다</p>
        <p>
          📦 {meta.groupIndex}묶음의 {ORDINAL[meta.positionInGroup]}번째 구절입니다
          {meta.positionInGroup === GROUP_SIZE && ' · 이 구절로 묶음이 완성돼요!'}
        </p>
      </div>

      <button onClick={handleSubmit} disabled={!isValid} className="btn-primary w-full">
        이번 주 말씀 추가
      </button>
    </div>
  );
}
