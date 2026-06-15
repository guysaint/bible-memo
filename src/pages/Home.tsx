import { useMemo, useState } from 'react';
import { useBibleStore } from '../store/useBibleStore';
import { useNavigation } from '../hooks/useNavigation';
import { groupByGroupIndex } from '../hooks/useVerses';
import { VerseCard } from '../components/verse/VerseCard';
import { GroupProgress } from '../components/verse/GroupProgress';
import { EmptyState } from '../components/ui/EmptyState';
import { ModeSelectModal } from '../components/practice/ModeSelectModal';
import { MODE_MAP } from '../components/practice/modeMeta';
import { verseRef } from '../services/verseLabel';
import { formatShortDate } from '../services/datetime';
import { GROUP_SIZE, type SessionMode, type Verse } from '../types';

export function Home() {
  const verses = useBibleStore((s) => s.verses);
  const sessions = useBibleStore((s) => s.sessions);
  const { navigate } = useNavigation();

  const [modalVerse, setModalVerse] = useState<Verse | null>(null);
  // 선택 상태: null이면 각각 현재 묶음 / 최신 구절을 가리킨다.
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);
  const [selectedVerseId, setSelectedVerseId] = useState<string | null>(null);

  const groups = useMemo(() => groupByGroupIndex(verses), [verses]);
  const allGroupIndexes = useMemo(
    () => [...groups.keys()].sort((a, b) => a - b),
    [groups],
  );

  if (verses.length === 0) {
    return (
      <EmptyState
        icon="🌱"
        title="아직 등록된 말씀이 없어요"
        description="이번 주에 암송할 첫 구절을 추가하고, 매주 한 절씩 마음에 새겨보세요."
        actionLabel="첫 구절 추가하기"
        onAction={() => navigate('add')}
      />
    );
  }

  // 가장 최근에 추가된 구절과 그 묶음을 기본값으로
  const latestVerse = verses[verses.length - 1];
  const currentGroupIndex = Math.max(...allGroupIndexes);

  const groupIndex = selectedGroupIndex ?? currentGroupIndex;
  const groupVerses = groups.get(groupIndex) ?? [];
  const isComplete = groupVerses.length >= GROUP_SIZE;

  const verseById = (id: string) => verses.find((v) => v.id === id);
  // 표시할 구절: 선택한 구절 → 없으면 최신 구절
  const displayVerse = (selectedVerseId && verseById(selectedVerseId)) || latestVerse;
  const isLatest = displayVerse.id === latestVerse.id;

  const recentSessions = [...sessions]
    .sort((a, b) => +new Date(b.sessionDate) - +new Date(a.sessionDate))
    .slice(0, 3);

  const handleSelectMode = (mode: SessionMode) => {
    if (!modalVerse) return;
    const id = modalVerse.id;
    setModalVerse(null);
    navigate('practice', { practiceVerseId: id, practiceMode: mode });
  };

  return (
    <div className="space-y-5">
      {/* 이번 주 말씀 (또는 선택한 말씀) */}
      <section>
        <h2 className="mb-2 px-1 text-sm font-semibold text-gray-500">
          {isLatest ? '이번 주 말씀' : '선택한 말씀'}
        </h2>
        <VerseCard
          verse={displayVerse}
          footer={
            <button
              onClick={() => setModalVerse(displayVerse)}
              className="btn-primary w-full"
            >
              오늘 암송하기
            </button>
          }
        />
      </section>

      {/* 묶음 진행 현황 */}
      <GroupProgress
        groupIndex={groupIndex}
        verses={groupVerses}
        isComplete={isComplete}
        selectedVerseId={displayVerse.id}
        onSelectVerse={(v) => setSelectedVerseId(v.id)}
        onAddSlot={() => navigate('add')}
        onStartExam={() => navigate('exam', { examGroupIndex: groupIndex })}
        allGroupIndexes={allGroupIndexes}
        onSelectGroup={(gi) => {
          setSelectedGroupIndex(gi);
          // 묶음을 바꾸면 그 묶음의 첫 구절을 카드에 표시
          const first = groups.get(gi)?.[0];
          setSelectedVerseId(first ? first.id : null);
        }}
      />

      {/* 최근 연습 기록 */}
      <section>
        <h2 className="mb-2 px-1 text-sm font-semibold text-gray-500">최근 연습 기록</h2>
        {recentSessions.length === 0 ? (
          <div className="rounded-2xl bg-white p-5 text-center text-sm text-gray-400">
            아직 연습 기록이 없어요. 위에서 “오늘 암송하기”를 눌러보세요!
          </div>
        ) : (
          <ul className="space-y-2">
            {recentSessions.map((s) => {
              const v = verseById(s.verseId);
              const meta = MODE_MAP[s.mode];
              return (
                <li
                  key={s.id}
                  className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm"
                >
                  <span className="text-xl">{meta.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {v ? verseRef(v) : '삭제된 구절'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {meta.label} · {formatShortDate(s.sessionDate)}
                    </p>
                  </div>
                  {typeof s.score === 'number' && (
                    <span className="shrink-0 text-sm font-bold text-bible-primary">
                      {s.score}점
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <ModeSelectModal
        verse={modalVerse}
        onClose={() => setModalVerse(null)}
        onSelect={handleSelectMode}
      />
    </div>
  );
}
