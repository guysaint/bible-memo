// 기록(구절·연습·시험)을 파일로 백업하고 새 기기에서 복원하는 섹션
import { useRef } from 'react';
import { exportBackupJson, importBackupJson } from '../../services/storage';
import { useToast } from './Toast';

export function BackupSection() {
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const blob = new Blob([exportBackupJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const today = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `BibleMemo-백업-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('백업 파일을 내보냈어요.');
  };

  const handleRestore = async (file: File) => {
    const ok = importBackupJson(await file.text());
    if (ok) {
      showToast('복원했어요. 새로고침합니다…');
      window.setTimeout(() => window.location.reload(), 900);
    } else {
      showToast('백업 파일을 읽지 못했어요.', 'error');
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <section>
      <h3 className="mb-2 px-1 text-sm font-semibold text-gray-500">기록 백업</h3>
      <div className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-xs leading-relaxed text-gray-500">
          기록은 이 기기에만 저장돼요. 폰을 바꾸거나 정리하면 사라질 수 있으니, 가끔 백업
          파일로 내보내 두면 새 기기에서 그대로 복원할 수 있어요.
        </p>
        <div className="flex flex-col gap-2">
          <button onClick={handleExport} className="btn-secondary w-full">
            ⬇ 내 기록 백업 내보내기
          </button>
          <button onClick={() => fileRef.current?.click()} className="btn-secondary w-full">
            ⬆ 백업 파일로 복원하기
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleRestore(f);
            }}
          />
        </div>
      </div>
    </section>
  );
}
