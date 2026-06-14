export type TabKey = 'home' | 'add' | 'practice' | 'exam' | 'history';

interface TabDef {
  key: TabKey;
  label: string;
  icon: string;
}

const TABS: TabDef[] = [
  { key: 'home', label: '홈', icon: '🏠' },
  { key: 'add', label: '추가', icon: '✏️' },
  { key: 'practice', label: '연습', icon: '🎯' },
  { key: 'exam', label: '시험', icon: '📝' },
  { key: 'history', label: '기록', icon: '📊' },
];

interface TabBarProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

export function TabBar({ active, onChange }: TabBarProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
      aria-label="주요 메뉴"
    >
      <div className="mx-auto flex max-w-lg">
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors ${
                isActive ? 'text-bible-primary' : 'text-gray-400'
              }`}
            >
              <span className={`text-xl leading-none ${isActive ? '' : 'grayscale'}`}>
                {tab.icon}
              </span>
              <span className={isActive ? 'font-semibold' : ''}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
