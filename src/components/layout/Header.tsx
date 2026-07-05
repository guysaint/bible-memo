import { todayLabel } from '../../services/datetime';

// 어르신도 찾기 쉽도록 모든 화면 상단에 사용법 버튼을 노출한다.
const GUIDE_URL = `${import.meta.env.BASE_URL}guide.html`;

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
        <div className="mt-0.5 flex items-center justify-between">
          <p className="text-xs text-gray-500">매주 한 절씩, 말씀을 마음에</p>
          <a
            href={GUIDE_URL}
            className="rounded-full border border-bible-primary/40 px-2.5 py-0.5 text-xs font-medium text-bible-primary"
          >
            📖 사용법
          </a>
        </div>
      </div>
    </header>
  );
}
