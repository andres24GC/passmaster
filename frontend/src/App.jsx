import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth';
import Nav from './components/Nav';
import Login from './pages/Login';
import Events from './pages/Events';
import MyTickets from './pages/MyTickets';
import Dashboard from './pages/Dashboard';
import Checkin from './pages/Checkin';

// Ruta protegida por rol (mapa de navegación en docs/NAVIGATION.md)
function Guard({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Events />} />
          <Route path="/login" element={<Login />} />
          <Route path="/tickets" element={<Guard><MyTickets /></Guard>} />
          <Route path="/admin" element={<Guard roles={['admin']}><Dashboard /></Guard>} />
          <Route path="/checkin" element={<Guard roles={['staff', 'admin']}><Checkin /></Guard>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}
