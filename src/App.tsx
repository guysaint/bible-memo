import { Header } from './components/layout/Header';
import { TabBar } from './components/layout/TabBar';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { NavigationProvider, useNavigation } from './hooks/useNavigation';
import { useAutoInstallBible } from './hooks/useAutoInstallBible';
import { Home } from './pages/Home';
import { AddVerse } from './pages/AddVerse';
import { Practice } from './pages/Practice';
import { Exam } from './pages/Exam';
import { History } from './pages/History';

function AppShell() {
  const { tab, navigate } = useNavigation();
  useAutoInstallBible();

  return (
    <div className="min-h-screen bg-bible-bg">
      <Header />
      <main className="mx-auto max-w-lg px-4 pb-28 pt-4">
        {tab === 'home' && <Home />}
        {tab === 'add' && <AddVerse />}
        {tab === 'practice' && <Practice />}
        {tab === 'exam' && <Exam />}
        {tab === 'history' && <History />}
        <p className="mt-8 text-center text-[11px] text-gray-400">
          개역개정 ⓒ 대한성서공회
        </p>
      </main>
      <TabBar active={tab} onChange={(t) => navigate(t)} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <NavigationProvider>
          <AppShell />
        </NavigationProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
