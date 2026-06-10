import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ShelterMap from './pages/ShelterMap';
import Evacuate from './pages/Evacuate';
import CheckIn from './pages/CheckIn';
import CoordDashboard from './pages/CoordDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Partner from './pages/Partner';

function PrivateRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, isAuth } = useAuth();
  if (!isAuth) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuth } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={isAuth ? <Navigate to="/dashboard" replace /> : <Landing />} />
        <Route path="/login" element={isAuth ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={isAuth ? <Navigate to="/dashboard" replace /> : <Register />} />
        <Route path="/partner" element={<Partner />} />
        <Route path="/shelters" element={<ShelterMap />} />
        <Route path="/evacuate" element={<Evacuate />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/checkin" element={<PrivateRoute><CheckIn /></PrivateRoute>} />
        <Route path="/coord" element={<PrivateRoute roles={['coordinator','admin']}><CoordDashboard /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
