import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CataloguePage from './pages/CataloguePage';
import MezmurPage from './pages/MezmurPage';
// import TunerPage from './pages/TunerPage';

function App() {
  return (
    <BrowserRouter>
      {/* Precision grunge stipple overlay across whole app */}
      <div className="fixed inset-0 pointer-events-none z-30 grunge-overlay" aria-hidden="true" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/catalogue" element={<CataloguePage />} />
        <Route path="/mezmur/:id" element={<MezmurPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;