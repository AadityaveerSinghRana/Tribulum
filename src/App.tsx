import { useEffect, useState } from 'react';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { ContactPage } from './pages/ContactPage';
import { FertiliserPage } from './pages/FertiliserPage';
import { FpoMembershipPage } from './pages/FpoMembershipPage';
import { HomePage } from './pages/HomePage';
import { TierDetailPage } from './pages/TierDetailPage';
import { VillageMembershipPage } from './pages/VillageMembershipPage';

function normalizePath(pathname: string): string {
  const clean = pathname.replace(/\/+$/, '') || '/';
  return clean;
}

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() =>
    normalizePath(window.location.pathname)
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(normalizePath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    const normalized = normalizePath(path);
    if (normalized !== currentPath) {
      window.history.pushState({}, '', normalized);
      setCurrentPath(normalized);
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return <HomePage onNavigate={navigate} />;
      case '/auth':
        return <AuthPage onNavigate={navigate} />;
      case '/membership/watch':
        return <TierDetailPage tierSlug="watch" onNavigate={navigate} />;
      case '/membership/scout':
        return <TierDetailPage tierSlug="scout" onNavigate={navigate} />;
      case '/membership/care':
        return <TierDetailPage tierSlug="care" onNavigate={navigate} />;
      case '/membership/full-care':
        return <TierDetailPage tierSlug="full-care" onNavigate={navigate} />;
      case '/membership/village':
        return <VillageMembershipPage />;
      case '/membership/fpo':
        return <FpoMembershipPage />;
      case '/fertiliser/soil-test':
        return <FertiliserPage mode="soil-test" onNavigate={navigate} />;
      case '/fertiliser/crop-season':
        return <FertiliserPage mode="crop-season" onNavigate={navigate} />;
      case '/fertiliser/custom-blend':
        return <FertiliserPage mode="custom-blend" onNavigate={navigate} />;
      case '/contact/team':
        return <ContactPage mode="team" onNavigate={navigate} />;
      case '/contact/fpo-partnership':
        return <ContactPage mode="fpo-partnership" onNavigate={navigate} />;
      case '/contact/field-support':
        return <ContactPage mode="field-support" onNavigate={navigate} />;
      case '/contact/callback':
        return <ContactPage mode="callback" onNavigate={navigate} />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col bg-black text-zinc-100">
        <Navbar currentPath={currentPath} onNavigate={navigate} />
        <main className="flex-1">{renderPage()}</main>
        <Footer onNavigate={navigate} />
      </div>
    </AuthProvider>
  );
}
