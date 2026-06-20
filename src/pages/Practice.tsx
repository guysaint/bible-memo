import { useEffect, useMemo, useRef, useState } from 'react';
import { useBibleStore } from '../store/useBibleStore';
import { useNavigation } from '../hooks/useNavigation';
import { groupByGroupIndex } from '../hooks/useVerses';
import { useToast } from '../components/ui/Toast';
import { EmptyState } from '../components/ui/EmptyState';
import { ModeSelectModal } from '../components/practice/ModeSelectModal';
import { MODE_MAP } from '../components/practice/modeMeta';
import { ReadingMode } from '../components/practice/ReadingMode';
import { FillBlankMode } from '../components/practice/FillBlankMode';
import { TypingMode } from '../components/practice/TypingMode';
import { ListeningMode } from '../components/practice/ListeningMode';
import { verseRef } from '../services/verseLabel';
import { formatShortDate } from '../services/datetime';
import type { SessionMode, Verse } from '../types';

type GroupFilter = number | 'all';

export function Practice() {
  const verses = useBibleStore((s) => s.verses);
  const sessions = useBibleStore((s) => s.sessions);
  const addSession = useBibleStore((s) => s.addSession);
  const markMastered = useBibleStore((s) => s.markMastered);
  const getCurrentGroup = useBibleStore((s) => s.getCurrentGroup);
  const { params, clearParams } = useNavigation();
  const { showToast } = useToast();

  // null이면 현재(최신) 묶음을 가리킨다. 숫자=특정 묶음, 'all'=전체
  const [selectedGroup, setSelectedGroup] = useState<GroupFilter | null>(null);
  const [pickerVerse, setPickerVerse] = useState<Verse | null>(null);
  const [active, setActive] = useState<{ verse: Verse; mode: SessionMode } | null>(null);

  // 세션 기록용
  const startRef = useRef<number>(0);
  const lastScoreRef = useRef<number | undefined>(undefined);

  // 네비게이션 파라미터로 진입 시 자동 시작
  useEffect(() => {
    if (params.practiceVerseId) {
      const v = verses.find((x) => x.id === params.practiceVerseId);
      if (v) {
        if (params.practiceMode) {
          startActive(v, params.practiceMode);
        } else {
          setPickerVerse(v);
        }
      }
      clearParams();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.practiceVerseId, params.practiceMode]);

  const startActive = (verse: Verse, mode: SessionMode) => {
    startRef.current = Date.now();
    lastScoreRef.current = undefined;
    setActive({ verse, mode });
  };

  const finishActive = () => {
    if (active) {
      const duration = Math.max(1, Math.round((Date.now() - startRef.current) / 1000));
      addSession({
        verseId: active.verse.id,
        sessionDate: new Date().toISOString(),
        mode: active.mode,
        score: lastScoreRef.current,
        durationSeconds: duration,
      });
    }
    setActive(null);
  };

  // 빈 상태
  if (verses.length === 0) {
    return (
      <EmptyState
        icon="🎯"
        title="연습할 구절이 없어요"
        description="먼저 구절을 추가하면 4가지 방식으로 암송을 연습할 수 있어요."
      />
    );
  }

  // 활성 모드 화면
  if (active) {
    const meta = MODE_MAP[active.mode];
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={finishActive}
            className="flex items-center gap-1 text-sm font-medium text-gray-500 transition-active"
          >
            ← 목록으로
          </button>
          <span className="text-sm font-medium text-gray-400">
            {meta.icon} {meta.label}
          </span>
        </div>

        {active.mode === 'reading' && <ReadingMode verse={active.verse} />}
        {active.mode === 'listening' && <ListeningMode verse={active.verse} />}
        {active.mode === 'fillBlank' && (
          <FillBlankMode
            verse={active.verse}
            onComplete={() => {
              /* 완료 결과는 컴포넌트 내부에서 표시 */
            }}
          />
        )}
        {active.mode === 'typing' && (
          <TypingMode
            verse={active.verse}
            onScored={(score) => {
              lastScoreRef.current = score;
              if (score >= 90 && !active.verse.isMastered) {
                markMastered(active.verse.id);
                showToast(`${verseRef(active.verse)} 마스터 달성! 🎉`);
              }
            }}
          />
        )}
      </div>
    );
  }

  // 구절 리스트
  const current = getCurrentGroup();
  const groups = useMemo(() => groupByGroupIndex(verses), [verses]);
  const allGroupIndexes = useMemo(
    () => [...groups.keys()].sort((a, b) => a - b),
    [groups],
  );
  const effectiveGroup: GroupFilter = selectedGroup ?? current.groupIndex;
  const list =
    effectiveGroup === 'all'
      ? [...verses].sort((a, b) => b.weekNumber - a.weekNumber)
      : groups.get(effectiveGroup) ?? [];

  const lastSessionOf = (verseId: string) =>
    sessions
      .filter((s) => s.verseId === verseId)
      .sort((a, b) => +new Date(b.sessionDate) - +new Date(a.sessionDate))[0];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">암송 연습</h2>

      {/* 묶음 선택 칩 (이전 묶음도 골라서 연습) */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {allGroupIndexes.map((gi) => (
          <button
            key={gi}
            onClick={() => setSelectedGroup(gi)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              effectiveGroup === gi
                ? 'bg-bible-primary text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {gi}묶음{gi === current.groupIndex ? ' (현재)' : ''}
          </button>
        ))}
        <button
          onClick={() => setSelectedGroup('all')}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            effectiveGroup === 'all'
              ? 'bg-bible-primary text-white'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          전체
        </button>
      </div>

      {list.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-center text-sm text-gray-400">
          이 묶음에는 아직 구절이 없어요.
        </p>
      ) : (
        <ul className="space-y-2">
          {list.map((v) => {
            const last = lastSessionOf(v.id);
            return (
              <li key={v.id}>
                <button
                  onClick={() => setPickerVerse(v)}
                  className="flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3.5 text-left shadow-sm transition-active active:scale-[0.99]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">{verseRef(v)}</span>
                      {v.isMastered && (
                        <span className="rounded-full bg-bible-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-bible-primary">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-gray-400">
                      {last
                        ? `최근 ${MODE_MAP[last.mode].label} · ${formatShortDate(last.sessionDate)}`
                        : `${formatShortDate(v.addedDate)} 추가`}
                    </p>
                  </div>
                  <span className="shrink-0 text-gray-300">›</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <ModeSelectModal
        verse={pickerVerse}
        onClose={() => setPickerVerse(null)}
        onSelect={(mode) => {
          const v = pickerVerse;
          setPickerVerse(null);
          if (v) startActive(v, mode);
        }}
      />
    </div>
  );
}
