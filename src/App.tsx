import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext";
import { SchemaProvider } from "./context/SchemaContext";
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Support from './pages/Support';
import Users from './pages/Users';
import Settings from './pages/Settings';
import DynamicList from './pages/DynamicList';

function App() {
  return (
    <AuthProvider>
      <SchemaProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="support" element={<Support />} />
              <Route path="settings" element={<Settings />} />
              <Route path="admin/:appLabel/:modelName" element={<DynamicList />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
          </SchemaProvider>
    </AuthProvider>
  );
}

export default App;
