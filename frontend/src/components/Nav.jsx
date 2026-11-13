import { Link } from 'react-router-dom';
import { useAuth } from '../auth';

export default function Nav() {
  const { user, logout } = useAuth();
  const link = 'px-3 py-1.5 rounded hover:bg-slate-700 text-sm font-medium transition text-slate-300';
  const activeLink = 'px-3 py-1.5 rounded bg-slate-700 text-white font-medium';

  return (
    <nav className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto p-3 flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-white">
          🎟 PassMaster
        </Link>

        {user && (
          <>
            {user.role === 'customer' && (
              <>
                <Link to="/" className={link}>Eventos</Link>
                <Link to="/tickets" className={link}>Mis tickets</Link>
              </>
            )}
            {user.role === 'staff' && (
              <Link to="/checkin" className={link}>Check-in</Link>
            )}
            {user.role === 'admin' && (
              <>
                <Link to="/admin" className={link}>Dashboard</Link>
                <Link to="/checkin" className={link}>Check-in</Link>
              </>
            )}
          </>
        )}

        <span className="flex-1" />

        {user ? (
          <>
            <span className="text-sm opacity-70 hidden md:block">
              {user.name} ({user.role})
            </span>
            <button
              onClick={logout}
              className={link}
            >
              Salir
            </button>
          </>
        ) : (
          <Link to="/login" className={link}>Ingresar</Link>
        )}
      </div>
    </nav>
  );
}
