// 숫자 입력(장/절)용 Stepper — 포커스 시 전체 선택, 편집 중 빈 칸 허용
import { useEffect, useState } from 'react';

interface StepperProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}

export function Stepper({ label, value, onChange, min = 1, max = 9999 }: StepperProps) {
  const set = (v: number) => onChange(Math.min(max, Math.max(min, v)));

  // 편집 중에는 빈 문자열을 허용하려고 내부 draft를 둔다. +/- 버튼 등 외부 변경과 동기화.
  const [draft, setDraft] = useState(String(value));
  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  return (
    <div className="flex-1">
      <label className="mb-1 block text-xs font-medium text-gray-500">{label}</label>
      <div className="flex items-stretch overflow-hidden rounded-xl border border-gray-200 bg-white">
        <button
          type="button"
          aria-label={`${label} 감소`}
          onClick={() => set(value - 1)}
          className="w-10 shrink-0 text-lg font-medium text-bible-primary transition-active active:bg-gray-50 disabled:text-gray-300"
          disabled={value <= min}
        >
          −
        </button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={draft}
          aria-label={label}
          onFocus={(e) => {
            // 클릭/탭 시 브라우저가 포커스 직후 커서를 다시 놓아 선택을 풀므로
            // 한 틱 미뤄 전체 선택을 다시 적용한다.
            const t = e.currentTarget;
            requestAnimationFrame(() => t.select());
          }}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, '');
            setDraft(digits);
            if (digits !== '') set(parseInt(digits, 10));
          }}
          onBlur={() => setDraft(String(value))}
          className="w-full min-w-0 border-x border-gray-100 bg-white py-2 text-center text-base font-semibold text-gray-800 outline-none"
        />
        <button
          type="button"
          aria-label={`${label} 증가`}
          onClick={() => set(value + 1)}
          className="w-10 shrink-0 text-lg font-medium text-bible-primary transition-active active:bg-gray-50 disabled:text-gray-300"
          disabled={value >= max}
        >
          +
        </button>
      </div>
    </div>
  );
}
