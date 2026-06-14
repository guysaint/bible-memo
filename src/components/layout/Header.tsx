import { todayLabel } from '../../services/datetime';

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-100 bg-bible-bg/90 px-5 pb-3 pt-4 backdrop-blur">
      <div className="mx-auto max-w-lg">
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-bold text-bible-primary">
            <span className="font-serif">BibleMemo</span>
          </h1>
          <span className="text-xs text-gray-400">{todayLabel()}</span>
        </div>
        <p className="mt-0.5 text-xs text-gray-500">매주 한 절씩, 말씀을 마음에</p>
      </div>
    </header>
  );
}
