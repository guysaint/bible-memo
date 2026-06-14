export interface WordResult {
  word: string; // 사용자 입력 단어 ('' 이면 누락)
  correct: string; // 정답 단어
  isCorrect: boolean;
}

/** 구두점 제거 + 공백 축약 + trim 정규화 */
function normalize(text: string): string {
  return text
    .replace(/[.,!?;:"'“”‘’()\[\]{}·…~\-–—「」『』<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toWords(text: string): string[] {
  const n = normalize(text);
  return n.length === 0 ? [] : n.split(' ');
}

/** 두 단어의 문자 bigram 자카드 유사도 (0~1) */
export function jaccardSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  const bigrams = (s: string): Set<string> => {
    if (s.length === 1) return new Set([s]);
    const set = new Set<string>();
    for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2));
    return set;
  };

  const setA = bigrams(a);
  const setB = bigrams(b);
  let inter = 0;
  for (const g of setA) if (setB.has(g)) inter++;
  const union = setA.size + setB.size - inter;
  return union === 0 ? 0 : inter / union;
}

const SIMILARITY_THRESHOLD = 0.85;

/**
 * 입력과 정답을 단어 단위로 채점한다.
 * 정렬은 인덱스 기준(같은 위치끼리 비교)으로 단순화하되,
 * 완전 일치 또는 자카드 유사도 85% 이상이면 정답으로 본다.
 */
export function scoreText(
  input: string,
  answer: string,
): { score: number; results: WordResult[] } {
  const inputWords = toWords(input);
  const answerWords = toWords(answer);

  const results: WordResult[] = [];
  let correctCount = 0;

  for (let i = 0; i < answerWords.length; i++) {
    const correct = answerWords[i];
    const word = inputWords[i] ?? '';
    const isCorrect =
      word.length > 0 &&
      (word === correct || jaccardSimilarity(word, correct) >= SIMILARITY_THRESHOLD);
    if (isCorrect) correctCount++;
    results.push({ word, correct, isCorrect });
  }

  const score =
    answerWords.length === 0
      ? 0
      : Math.round((correctCount / answerWords.length) * 100);

  return { score, results };
}

/** Mulberry32 시드 기반 의사난수 생성기 */
function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 본문 단어 중 ratio 비율을 블랭크 처리한다.
 * 첫/마지막 단어는 항상 표시. seed 미지정 시 Date.now() 기반(세션마다 다름).
 */
export function generateBlanks(
  text: string,
  ratio = 0.4,
  seed: number = Date.now(),
): { words: string[]; blanks: Set<number> } {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const blanks = new Set<number>();
  if (words.length <= 2) return { words, blanks };

  // 첫/마지막 제외한 후보 인덱스
  const candidates: number[] = [];
  for (let i = 1; i < words.length - 1; i++) candidates.push(i);

  const targetCount = Math.max(1, Math.round(candidates.length * ratio));

  // 시드 기반 Fisher-Yates 셔플
  const rand = mulberry32(seed);
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  for (let i = 0; i < targetCount && i < candidates.length; i++) {
    blanks.add(candidates[i]);
  }

  return { words, blanks };
}
