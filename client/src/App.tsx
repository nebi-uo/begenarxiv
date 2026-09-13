import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CataloguePage from './pages/CataloguePage';
import MezmurPage from './pages/MezmurPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CataloguePage />} />
        <Route path="/mezmur/:id" element={<MezmurPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;