// 첫 실행 시 내장된 개역개정 본문을 자동으로 설치(IndexedDB)하는 훅
import { useEffect } from 'react';
import { countVerses, importFromUrl, BUNDLED_BIBLE_URL } from '../services/bibleData';
import { useToast } from '../components/ui/Toast';

// StrictMode 이중 실행·재마운트에도 한 번만 시도
let attempted = false;

export function useAutoInstallBible() {
  const { showToast } = useToast();

  useEffect(() => {
    if (attempted) return;
    attempted = true;

    (async () => {
      try {
        if ((await countVerses()) > 0) return; // 이미 설치됨
        const n = await importFromUrl(BUNDLED_BIBLE_URL);
        showToast(`성경 본문 준비 완료 (${n.toLocaleString()}구절)`);
      } catch (err) {
        // 오프라인 첫 실행 등 실패 시 다음 실행에서 다시 시도
        attempted = false;
        console.warn('[auto-install] 본문 자동 설치 실패, 다음 실행에 재시도', err);
      }
    })();
  }, [showToast]);
}
