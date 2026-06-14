import { useBibleStore } from '../store/useBibleStore';
import type { Verse } from '../types';

/** 구절 관련 파생 데이터 훅 */
export function useVerses() {
  const verses = useBibleStore((s) => s.verses);
  const getGroupVerses = useBibleStore((s) => s.getGroupVerses);

  const groups = groupByGroupIndex(verses);

  return { verses, groups, getGroupVerses };
}

export function groupByGroupIndex(verses: Verse[]): Map<number, Verse[]> {
  const map = new Map<number, Verse[]>();
  for (const v of verses) {
    const arr = map.get(v.groupIndex) ?? [];
    arr.push(v);
    map.set(v.groupIndex, arr);
  }
  for (const arr of map.values()) {
    arr.sort((a, b) => a.positionInGroup - b.positionInGroup);
  }
  return map;
}
