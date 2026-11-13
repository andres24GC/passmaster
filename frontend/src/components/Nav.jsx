import { Link } from 'react-router-dom';
import { useAuth } from '../auth';

export default function Nav() {
  const { user, logout } = useAuth();
  const link = 'px-3 py-1.5 rounded hover:bg-indigo-500 text-sm font-medium transition';
  const activeLink = 'px-3 py-1.5 rounded bg-indigo-500/20 text-indigo-400 font-medium';

  return (
    <nav className="bg-indigo-700 text-white border-b border-indigo-600 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto p-3 flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          🎟 PassMaster
        </Link>

        {user && (
          <>
            {/* Cliente: puede ver eventos y comprar */}
            {user.role === 'customer' && (
              <>
                <Link
                  to="/"
                  className={link}
                >
                  Eventos
                </Link>
                <Link
                  to="/tickets"
                  className={link}
                >
                  Mis tickets
                </Link>
              </>
            )}

            {/* Staff: solo check-in (no puede comprar boletos) */}
            {user.role === 'staff' && (
              <Link to="/checkin" className={link}>
                Check-in
              </Link>
            )}

            {/* Admin: dashboard y check-in */}
            {user.role === 'admin' && (
              <>
                <Link to="/admin" className={link}>
                  Dashboard
                </Link>
                <Link to="/checkin" className={link}>
                  Check-in
                </Link>
              </>
            )}
          </>
        )}

        <span className="flex-1" />

        {user ? (
          <>
            <span className="text-sm opacity-80 hidden md:block">
              {user.name} ({user.role})
            </span>
            <button
              onClick={logout}
              className={link}
              onMouseEnter={(e) => (e.currentTarget.className = link.replace('hover:bg-indigo-500', 'bg-red-600'))}
              onMouseLeave={(e) => (e.currentTarget.className = link)}
            >
              Salir
            </button>
          </>
        ) : (
          <Link to="/login" className={link}>
            Ingresar
          </Link>
        )}
      </div>
    </nav>
  );
}
