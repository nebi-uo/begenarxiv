import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CataloguePage from './pages/CataloguePage';
import MezmurPage from './pages/MezmurPage';
// import TunerPage from './pages/TunerPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/catalogue" element={<CataloguePage />} />
        <Route path="/mezmur/:id" element={<MezmurPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;