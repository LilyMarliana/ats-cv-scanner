import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { BulkUpload } from './pages/BulkUpload';
import { Positions } from './pages/Positions';
import { CvHistory } from './pages/CvHistory';
import { CompareCv } from './pages/CompareCv';
import { CvDetail } from './pages/CvDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />

          <Route
            path="/upload"
            element={<BulkUpload />}
          />

          <Route
            path="/positions"
            element={<Positions />}
          />

          <Route
            path="/history"
            element={<CvHistory />}
          />

          <Route
            path="/compare"
            element={<CompareCv />}
          />

          {/* Detail satu CV */}
          <Route
            path="/cv/:id"
            element={<CvDetail />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;