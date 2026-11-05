import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const CataloguePage = lazy(() => import('./pages/CataloguePage'));
const MezmurPage = lazy(() => import('./pages/MezmurPage'));
const PortalPage = lazy(() => import('./pages/PortalPage'));
const ContributePage = lazy(() => import('./pages/ContributePage'));
const RequestPage = lazy(() => import('./pages/RequestPage'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-950 rounded-full animate-spin" />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/catalogue" element={<CataloguePage />} />
            <Route path="/mezmur/:id" element={<MezmurPage />} />
            <Route path="/contribute" element={<ContributePage />} />
            <Route path="/request" element={<RequestPage />} />
            <Route path="/portal" element={<PortalPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
