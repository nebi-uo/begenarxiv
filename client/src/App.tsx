import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CataloguePage from './pages/CataloguePage';
import MezmurPage from './pages/MezmurPage';
import PortalPage from './pages/PortalPage';
import ContributePage from './pages/ContributePage';
import RequestPage from './pages/RequestPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/catalogue" element={<CataloguePage />} />
        <Route path="/mezmur/:id" element={<MezmurPage />} />
        <Route path="/contribute" element={<ContributePage />} />
        <Route path="/request" element={<RequestPage />} />
        <Route path="/portal" element={<PortalPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
