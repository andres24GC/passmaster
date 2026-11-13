import { Link } from 'react-router-dom';
import { useAuth } from '../auth';

export default function Nav() {
  const { user, logout } = useAuth();
  const link = 'px-3 py-1 rounded hover:bg-indigo-500';
  return (
    <nav className="bg-indigo-700 text-white">
      <div className="max-w-5xl mx-auto p-3 flex items-center gap-2">
        <Link to="/" className="font-bold text-lg mr-4">🎟 PassMaster</Link>
        <Link to="/" className={link}>Eventos</Link>
        {user && <Link to="/tickets" className={link}>Mis tickets</Link>}
        {user && ['staff', 'admin'].includes(user.role) && <Link to="/checkin" className={link}>Check-in</Link>}
        {user?.role === 'admin' && <Link to="/admin" className={link}>Dashboard</Link>}
        <span className="flex-1" />
        {user ? (
          <>
            <span className="text-sm opacity-80">{user.name} ({user.role})</span>
            <button onClick={logout} className={link}>Salir</button>
          </>
        ) : <Link to="/login" className={link}>Ingresar</Link>}
      </div>
    </nav>
  );
}
