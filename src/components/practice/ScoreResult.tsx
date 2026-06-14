import type { WordResult } from '../../services/scoring';

interface ScoreResultProps {
  score: number;
  results: WordResult[];
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-bible-primary';
  if (score >= 50) return 'text-bible-accent';
  return 'text-red-500';
}

/** 단어별 채색 채점 결과 + 정확도 */
export function ScoreResult({ score, results }: ScoreResultProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-xs text-gray-500">정확도</p>
        <p className={`text-5xl font-bold ${scoreColor(score)}`}>{score}%</p>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="font-serif text-lg leading-loose">
          {results.map((r, i) => (
            <span key={i} className="mx-0.5 inline-block">
              {r.isCorrect ? (
                <span className="text-bible-primary">{r.word || r.correct}</span>
              ) : (
                <span className="inline-flex flex-col items-center align-bottom">
                  <span className="text-red-500 line-through decoration-red-300">
                    {r.word || '∅'}
                  </span>
                  <span className="text-xs font-medium text-gray-500">{r.correct}</span>
                </span>
              )}
            </span>
          ))}
        </p>
      </div>
      <p className="text-center text-xs text-gray-400">
        <span className="text-bible-primary">초록</span>은 정답,{' '}
        <span className="text-red-500">빨강</span>은 다시 볼 단어예요. 아래 작은 글씨가 정답입니다.
      </p>
    </div>
  );
}
