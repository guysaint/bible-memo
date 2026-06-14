import { useEffect, useMemo, useState } from 'react';
import { useBibleStore } from '../store/useBibleStore';
import { useNavigation } from '../hooks/useNavigation';
import { useToast } from '../components/ui/Toast';
import { EmptyState } from '../components/ui/EmptyState';
import { ExamSession } from '../components/exam/ExamSession';
import { ExamResult } from '../components/exam/ExamResult';
import { groupByGroupIndex } from '../hooks/useVerses';
import { verseRef } from '../services/verseLabel';
import { formatShortDate } from '../services/datetime';
import { GROUP_SIZE, EXAM_PASS_SCORE, type Verse } from '../types';

type Stage =
  | { kind: 'list' }
  | { kind: 'session'; groupIndex: number; verses: Verse[] }
  | {
      kind: 'result';
      groupIndex: number;
      verses: Verse[];
      scores: Record<string, number>;
      average: number;
      isPassed: boolean;
    };

export function Exam() {
  const verses = useBibleStore((s) => s.verses);
  const exams = useBibleStore((s) => s.exams);
  const addExam = useBibleStore((s) => s.addExam);
  const markMastered = useBibleStore((s) => s.markMastered);
  const { params, clearParams, navigate } = useNavigation();
  const { showToast } = useToast();

  const [stage, setStage] = useState<Stage>({ kind: 'list' });

  const groups = useMemo(() => groupByGroupIndex(verses), [verses]);
  const sortedGroupIndexes = useMemo(
    () => [...groups.keys()].sort((a, b) => a - b),
    [groups],
  );

  const startExam = (groupIndex: number) => {
    const gv = (groups.get(groupIndex) ?? []).slice(0, GROUP_SIZE);
    if (gv.length < GROUP_SIZE) return;
    setStage({ kind: 'session', groupIndex, verses: gv });
  };

  // 홈에서 examGroupIndex로 진입 시 자동 시작
  useEffect(() => {
    if (params.examGroupIndex != null) {
      const gi = params.examGroupIndex;
      clearParams();
      const gv = (groups.get(gi) ?? []).slice(0, GROUP_SIZE);
      if (gv.length >= GROUP_SIZE) {
        setStage({ kind: 'session', groupIndex: gi, verses: gv });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.examGroupIndex]);

  const handleComplete = (groupIndex: number, gv: Verse[], scores: Record<string, number>) => {
    const values = gv.map((v) => scores[v.id] ?? 0);
    const average = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    const isPassed = average >= EXAM_PASS_SCORE;

    addExam({
      groupIndex,
      examDate: new Date().toISOString(),
      verseIds: gv.map((v) => v.id),
      scores,
      isPassed,
    });

    if (isPassed) {
      gv.forEach((v) => {
        if (!v.isMastered) markMastered(v.id);
      });
      showToast(`${groupIndex}묶음 마스터 달성! 🎉`);
    }

    setStage({ kind: 'result', groupIndex, verses: gv, scores, average, isPassed });
  };

  // ── 시험 진행 ──
  if (stage.kind === 'session') {
    return (
      <ExamSession
        groupIndex={stage.groupIndex}
        verses={stage.verses}
        onComplete={(scores) => handleComplete(stage.groupIndex, stage.verses, scores)}
        onCancel={() => setStage({ kind: 'list' })}
      />
    );
  }

  // ── 결과 ──
  if (stage.kind === 'result') {
    return (
      <ExamResult
        groupIndex={stage.groupIndex}
        verses={stage.verses}
        scores={stage.scores}
        average={stage.average}
        isPassed={stage.isPassed}
        onFocusPractice={(verseId) =>
          navigate('practice', { practiceVerseId: verseId, practiceMode: 'typing' })
        }
        onRetry={() => startExam(stage.groupIndex)}
        onDone={() => setStage({ kind: 'list' })}
      />
    );
  }

  // ── 묶음 선택 목록 ──
  if (verses.length === 0) {
    return (
      <EmptyState
        icon="📝"
        title="시험 볼 묶음이 없어요"
        description="구절 4개로 한 묶음이 완성되면 묶음 시험을 볼 수 있어요."
      />
    );
  }

  const latestExamOf = (groupIndex: number) =>
    exams
      .filter((e) => e.groupIndex === groupIndex)
      .sort((a, b) => +new Date(b.examDate) - +new Date(a.examDate))[0];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">묶음 시험</h2>
        <p className="mt-0.5 text-sm text-gray-500">완성된 묶음을 골라 4개 구절을 점검하세요.</p>
      </div>

      <ul className="space-y-3">
        {sortedGroupIndexes.map((gi) => {
          const gv = (groups.get(gi) ?? []).slice().sort((a, b) => a.positionInGroup - b.positionInGroup);
          const complete = gv.length >= GROUP_SIZE;
          const exam = latestExamOf(gi);
          const remaining = GROUP_SIZE - gv.length;

          return (
            <li key={gi}>
              <div
                className={`rounded-2xl bg-white p-5 shadow-sm ${
                  complete ? '' : 'opacity-80'
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">{gi}묶음</h3>
                  {complete && exam && (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        exam.isPassed
                          ? 'bg-bible-primary/10 text-bible-primary'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {exam.isPassed ? '합격' : '재도전 필요'} · {formatShortDate(exam.examDate)}
                    </span>
                  )}
                  {complete && !exam && (
                    <span className="rounded-full bg-bible-accent/15 px-2.5 py-0.5 text-xs font-semibold text-bible-accent">
                      시험 가능
                    </span>
                  )}
                </div>

                <ul className="mb-4 space-y-1">
                  {gv.map((v) => (
                    <li key={v.id} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-bible-primary">·</span>
                      {verseRef(v)}
                      {exam && (
                        <span className="ml-auto text-xs text-gray-400">
                          {exam.scores[v.id] ?? '–'}점
                        </span>
                      )}
                    </li>
                  ))}
                </ul>

                {complete ? (
                  <button onClick={() => startExam(gi)} className="btn-primary w-full">
                    {exam ? '다시 시험 보기' : '시험 시작'}
                  </button>
                ) : (
                  <p className="rounded-xl bg-gray-50 py-2.5 text-center text-sm text-gray-400">
                    아직 {remaining}개 구절이 더 필요해요
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
