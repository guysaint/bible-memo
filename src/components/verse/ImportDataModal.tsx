// 개역개정 등 본문 데이터를 기기에 가져오는 모달 — 파일 업로드, 양식·샘플 내려받기, 비우기
import { useRef, useState } from 'react';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';
import {
  importVerses,
  importFromUrl,
  clearVerses,
  parseVerseFile,
  type VerseRow,
} from '../../services/bibleData';

interface ImportDataModalProps {
  open: boolean;
  onClose: () => void;
  count: number;
  onChanged: () => void;
}

// 교회가 본문 파일을 올려둔 주소(빌드 시 주입). 있으면 "한 번 탭 설치" 버튼이 보인다.
const PRESET_URL = (import.meta.env.VITE_BIBLE_DATA_URL as string | undefined)?.trim();

// 구조만 보여주는 샘플(실제 성경 본문 아님)
const SAMPLE: VerseRow[] = [
  { book: '요한복음', chapter: 3, verse: 16, text: '여기에 요한복음 3장 16절 본문을 넣으세요' },
  { book: '요한복음', chapter: 3, verse: 17, text: '여기에 요한복음 3장 17절 본문을 넣으세요' },
  { book: '시편', chapter: 23, verse: 1, text: '여기에 시편 23편 1절 본문을 넣으세요' },
];

export function ImportDataModal({ open, onClose, count, onChanged }: ImportDataModalProps) {
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState('');

  const handleFile = async (file: File) => {
    setBusy(true);
    try {
      const content = await file.text();
      const rows = parseVerseFile(file.name, content);
      if (rows.length === 0) {
        showToast('가져올 본문을 찾지 못했어요. 양식을 확인해 주세요.', 'error');
        return;
      }
      const n = await importVerses(rows);
      showToast(`본문 ${n.toLocaleString()}구절을 가져왔어요!`);
      onChanged();
    } catch (err) {
      console.error('[import] 실패', err);
      showToast('파일을 읽지 못했어요. 형식을 확인해 주세요.', 'error');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleUrl = async (target: string) => {
    if (!target) return;
    setBusy(true);
    try {
      const n = await importFromUrl(target);
      showToast(`본문 ${n.toLocaleString()}구절을 설치했어요!`);
      onChanged();
    } catch (err) {
      console.error('[import-url] 실패', err);
      showToast('주소에서 본문을 받지 못했어요. 주소를 확인해 주세요.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const downloadSample = () => {
    const blob = new Blob([JSON.stringify(SAMPLE, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bible-memo-본문양식.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = async () => {
    await clearVerses();
    showToast('가져온 본문을 비웠어요.');
    onChanged();
  };

  return (
    <Modal open={open} onClose={onClose} title="본문 데이터 가져오기">
      <div className="space-y-4 text-sm">
        <p className="leading-relaxed text-gray-600">
          정당하게 보유하신 성경 본문 파일을 가져오면, 책·장·절을 고를 때 본문이 자동으로
          채워져요. 가져온 본문은 <b>이 기기에만</b> 저장되고 인터넷이나 공개 사이트에는 올라가지
          않습니다.
        </p>

        {count > 0 ? (
          <div className="flex items-center justify-between rounded-xl bg-bible-primary/5 px-4 py-3">
            <span className="text-gray-700">
              현재 <b>{count.toLocaleString()}</b>구절 저장됨
            </span>
            <button onClick={handleClear} className="text-xs font-medium text-red-500">
              비우기
            </button>
          </div>
        ) : (
          <div className="rounded-xl bg-gray-50 px-4 py-3 text-gray-500">
            아직 가져온 본문이 없어요.
          </div>
        )}

        <div>
          <p className="mb-1 font-medium text-gray-700">파일 형식</p>
          <p className="leading-relaxed text-gray-500">
            JSON 또는 CSV·TSV. 각 항목은 책 이름, 장, 절, 본문으로 구성돼요. 책 이름은 앱의 책
            이름과 똑같이 맞춰 주세요(예: 요한복음).
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-gray-900 p-3 text-[11px] leading-relaxed text-gray-100">
{`[
  { "book": "요한복음", "chapter": 3,
    "verse": 16, "text": "본문..." }
]`}
          </pre>
        </div>

        {/* 한 번 탭 설치(교회가 주소를 미리 넣어둔 경우) */}
        {PRESET_URL && (
          <button
            onClick={() => handleUrl(PRESET_URL)}
            disabled={busy}
            className="btn-primary w-full text-base"
          >
            {busy ? '설치하는 중…' : '📖 성경 본문 설치 (한 번에)'}
          </button>
        )}

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-gray-400">
            {PRESET_URL ? '다른 방법으로 가져오기' : '가져오기'}
          </p>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="btn-secondary w-full"
          >
            📥 파일 선택해서 가져오기
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,.csv,.tsv,.txt,application/json,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />

          {/* 인터넷 주소로 가져오기 */}
          <div className="flex gap-2">
            <input
              type="url"
              inputMode="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="본문 파일 인터넷 주소(URL)"
              className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-bible-primary"
            />
            <button
              onClick={() => handleUrl(url.trim())}
              disabled={busy || url.trim() === ''}
              className="btn-secondary shrink-0 px-4 py-2 text-sm"
            >
              가져오기
            </button>
          </div>

          <button onClick={downloadSample} className="text-xs font-medium text-bible-primary">
            ⬇ 빈 양식·샘플 내려받기
          </button>
        </div>
      </div>
    </Modal>
  );
}
