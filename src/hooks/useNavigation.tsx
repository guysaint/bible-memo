import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { TabKey } from '../components/layout/TabBar';
import type { SessionMode } from '../types';

interface NavParams {
  /** 연습 탭에서 곧바로 열 구절 id */
  practiceVerseId?: string;
  /** 연습 탭 진입 시 곧바로 시작할 모드 */
  practiceMode?: SessionMode;
  /** 시험 탭에서 곧바로 선택할 묶음 */
  examGroupIndex?: number;
}

interface NavContextValue {
  tab: TabKey;
  params: NavParams;
  navigate: (tab: TabKey, params?: NavParams) => void;
  clearParams: () => void;
}

const NavContext = createContext<NavContextValue | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<TabKey>('home');
  const [params, setParams] = useState<NavParams>({});

  const value = useMemo<NavContextValue>(
    () => ({
      tab,
      params,
      navigate: (next, p = {}) => {
        setTab(next);
        setParams(p);
        window.scrollTo({ top: 0 });
      },
      clearParams: () => setParams({}),
    }),
    [tab, params],
  );

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNavigation(): NavContextValue {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider');
  return ctx;
}
