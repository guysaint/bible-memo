import { useMemo, useState } from 'react';
import { useBibleStore } from '../store/useBibleStore';
import { groupByGroupIndex } from '../hooks/useVerses';
import { EmptyState } from '../components/ui/EmptyState';
import { BackupSection } from '../components/ui/BackupSection';
import { VerseDetailModal } from '../components/verse/VerseDetailModal';
import { MODE_MAP } from '../components/practice/modeMeta';
import { verseRef } from '../services/verseLabel';
import { formatDateTime } from '../services/datetime';
import type { Verse } from '../types';

export function History() {
  const verses = useBibleStore((s) => s.verses);
  const sessions = useBibleStore((s) => s.sessions);
  const getStats = useBibleStore((s) => s.getStats);

  const stats = getStats();
  const groups = useMemo(() => groupByGroupIndex(verses), [verses]);
  const sortedGroups = useMemo(() => [...groups.keys()].sort((a, b) => a - b), [groups]);

  const [openGroups, setOpenGroups] = useState<Set<number>>(() => new Set([1]));
  const [detail, setDetail] = useState<Verse | null>(null);

  const recentSessions = useMemo(
    () =>
      [...sessions]
        .sort((a, b) => +new Date(b.sessionDate) - +new Date(a.sessionDate))
        .slice(0, 20),
    [sessions],
  );

  const verseById = (id: string) => verses.find((v) => v.id === id);

  const toggleGroup = (gi: number) =>
    setOpenGroups((prev) => {
      const n = new Set(prev);
      if (n.has(gi)) n.delete(gi);
      else n.add(gi);
      return n;
    });

  if (verses.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon="📊"
          title="아직 기록이 없어요"
          description="구절을 추가하고 연습을 시작하면 이곳에 통계와 이력이 쌓여요. 예전에 쓰던 기기가 있다면 아래에서 백업을 복원할 수 있어요."
        />
        <BackupSection />
      </div>
    );
  }

  const STAT_CARDS = [
    { label: '총 구절', value: `${stats.totalVerses}개` },
    { label: '총 연습', value: `${stats.totalSessions}회` },
    { label: '연속 연습', value: `${stats.streak}일` },
    { label: '시험 합격률', value: `${stats.passRate}%` },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">나의 기록</h2>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-3">
        {STAT_CARDS.map((c) => (
          <div key={c.label} className="rounded-2xl bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-bible-primary">{c.value}</p>
            <p className="mt-0.5 text-xs text-gray-400">{c.label}</p>
          </div>
        ))}
      </div>

      {/* 묶음별 구절 아코디언 */}
      <section>
        <h3 className="mb-2 px-1 text-sm font-semibold text-gray-500">구절 목록</h3>
        <div className="space-y-2">
          {sortedGroups.map((gi) => {
            const gv = groups.get(gi) ?? [];
            const isOpen = openGroups.has(gi);
            const masteredCount = gv.filter((v) => v.isMastered).length;
            return (
              <div key={gi} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <button
                  onClick={() => toggleGroup(gi)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between px-5 py-4"
                >
                  <span className="font-semibold text-gray-800">
                    {gi}묶음
                    <span className="ml-2 text-xs font-normal text-gray-400">
                      {gv.length}개 · 마스터 {masteredCount}
                    </span>
                  </span>
                  <span
                    className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  >
                    ▾
                  </span>
                </button>
                {isOpen && (
                  <ul className="border-t border-gray-50">
                    {gv.map((v) => (
                      <li key={v.id}>
                        <button
                          onClick={() => setDetail(v)}
                          className="flex w-full items-center gap-3 px-5 py-3 text-left transition-active active:bg-gray-50"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bible-primary/10 text-xs font-semibold text-bible-primary">
                            {v.weekNumber}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-800">
                              {verseRef(v)}
                            </p>
                          </div>
                          {v.isMastered && (
                            <span className="text-xs font-semibold text-bible-primary">✓</span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 연습 이력 타임라인 */}
      <section>
        <h3 className="mb-2 px-1 text-sm font-semibold text-gray-500">연습 이력</h3>
        {recentSessions.length === 0 ? (
          <p className="rounded-2xl bg-white p-5 text-center text-sm text-gray-400">
            아직 연습 이력이 없어요.
          </p>
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
                  <span className="text-lg">{meta.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {v ? verseRef(v) : '삭제된 구절'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {meta.label} · {formatDateTime(s.sessionDate)}
                    </p>
                  </div>
                  {typeof s.score === 'number' && (
                    <span className="text-sm font-bold text-bible-primary">{s.score}점</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <BackupSection />

      <VerseDetailModal verse={detail} sessions={sessions} onClose={() => setDetail(null)} />
    </div>
  );
}
