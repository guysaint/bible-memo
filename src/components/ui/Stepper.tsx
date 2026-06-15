interface StepperProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}

export function Stepper({ label, value, onChange, min = 1, max = 9999 }: StepperProps) {
  const set = (v: number) => onChange(Math.min(max, Math.max(min, v)));

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
          type="number"
          inputMode="numeric"
          value={value}
          min={min}
          max={max}
          aria-label={label}
          onFocus={(e) => e.target.select()}
          onChange={(e) => set(parseInt(e.target.value, 10) || min)}
          className="w-full min-w-0 border-x border-gray-100 bg-white py-2 text-center text-base font-semibold text-gray-800 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
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
