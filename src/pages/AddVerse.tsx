import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { OLD_TESTAMENT, NEW_TESTAMENT, findBook } from '../data/bibleBooks';
import { Stepper } from '../components/ui/Stepper';
import { useBibleStore, calculateMeta } from '../store/useBibleStore';
import { useToast } from '../components/ui/Toast';
import { useNavigation } from '../hooks/useNavigation';
import { getVerseText, countVerses } from '../services/bibleData';
import { ImportDataModal } from '../components/verse/ImportDataModal';
import { GROUP_SIZE } from '../types';

const ORDINAL = ['', '첫', '두', '세', '네'];

type FetchStatus = 'idle' | 'loading' | 'filled' | 'notfound';

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
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>('idle');

  // 가져온 본문 데이터(IndexedDB) 개수 + 가져오기 모달
  const [dataCount, setDataCount] = useState(0);
  const [importOpen, setImportOpen] = useState(false);
  const refreshCount = useCallback(() => {
    countVerses()
      .then(setDataCount)
      .catch(() => setDataCount(0));
  }, []);
  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  const maxChapter = useMemo(() => findBook(book)?.chapters ?? 150, [book]);

  // 책·장·절 선택이 바뀌면 가져온 로컬 본문에서 자동으로 채운다.
  // 사용자가 직접 고친 본문도, 선택을 다시 바꾸면 새로 덮어쓴다.
  const reqIdRef = useRef(0);
  useEffect(() => {
    if (!book || dataCount === 0) {
      setFetchStatus('idle');
      return;
    }
    const end = useRange ? verseEnd : undefined;
    const reqId = ++reqIdRef.current;
    setFetchStatus('loading');

    const timer = window.setTimeout(() => {
      getVerseText(book, chapter, verseStart, end)
        .then((result) => {
          if (reqId !== reqIdRef.current) return; // 최신 요청만 반영
          if (result) {
            setText(result);
            setFetchStatus('filled');
          } else {
            setFetchStatus('notfound');
          }
        })
        .catch(() => {
          if (reqId !== reqIdRef.current) return;
          setFetchStatus('notfound');
        });
    }, 250);

    return () => window.clearTimeout(timer);
  }, [book, chapter, verseStart, verseEnd, useRange, dataCount]);

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
    setFetchStatus('idle');
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
          <label className="text-xs font-medium text-gray-500">본문</label>
          <span
            className={`text-xs ${trimmedLen >= 10 ? 'text-gray-400' : 'text-bible-accent'}`}
          >
            {trimmedLen}자
          </span>
        </div>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setFetchStatus('idle');
          }}
          rows={6}
          placeholder="본문을 직접 입력하거나, 본문 데이터를 가져오면 자동으로 채워져요"
          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-3 font-serif text-base leading-relaxed text-gray-800 outline-none focus:border-bible-primary"
        />
        <div className="mt-1 flex items-start justify-between gap-2">
          <p className="text-xs text-gray-400">
            {fetchStatus === 'loading' && '본문 불러오는 중…'}
            {fetchStatus === 'filled' && '✓ 가져온 본문을 자동으로 채웠어요 (필요하면 수정하세요)'}
            {fetchStatus === 'notfound' && '이 절을 데이터에서 못 찾았어요. 직접 입력해 주세요.'}
            {fetchStatus === 'idle' &&
              (dataCount > 0
                ? `내 본문 ${dataCount.toLocaleString()}구절 사용 중`
                : '본문 데이터를 가져오면 자동으로 채워져요.')}
          </p>
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="shrink-0 text-xs font-medium text-bible-primary"
          >
            본문 데이터 가져오기
          </button>
        </div>
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

      <ImportDataModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        count={dataCount}
        onChanged={refreshCount}
      />
    </div>
  );
}
