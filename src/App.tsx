import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<div className="text-xl font-bold">User Management (Coming Soon)</div>} />
          <Route path="support" element={<div className="text-xl font-bold">Support & Feedback (Coming Soon)</div>} />
          <Route path="settings" element={<div className="text-xl font-bold">App Settings (Coming Soon)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
