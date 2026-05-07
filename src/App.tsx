import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import { Layout } from './components/Layout';
import { useApplyTheme } from './hooks/useApplyTheme';

const History = lazy(() => import('./pages/History'));
const Profiles = lazy(() => import('./pages/Profiles'));
const Settings = lazy(() => import('./pages/Settings'));

const PageFallback = () => (
  <div className="text-sm text-muted py-10 text-center">Carregando…</div>
);

export default function App() {
  useApplyTheme();
  return (
    <Layout>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/historico" element={<History />} />
          <Route path="/perfis" element={<Profiles />} />
          <Route path="/configuracoes" element={<Settings />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
