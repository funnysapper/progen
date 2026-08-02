import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Workspace from './pages/Workspace';
import type { ReactNode } from 'react';

function Protected({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicOnly({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/app" replace /> : <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
          <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
          <Route path="/app" element={<Protected><Workspace /></Protected>} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
