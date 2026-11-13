import { useEffect, useState } from 'react';
import { api } from '../api';

// Aforo en tiempo real y creación de eventos (solo admin)
export default function Dashboard() {
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [f, setF] = useState({ name: '', venue: '', starts_at: '', capacity: 100, price: 0, description: '' });
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    try {
      const data = await api('/admin/dashboard');
      setRows(data);

      // Calcular estadísticas globales
      const totalEvents = data.length;
      const totalCapacity = data.reduce((acc, r) => acc + Number(r.capacity || 0), 0);
      const totalSold = data.reduce((acc, r) => acc + Number(r.sold || 0), 0);
      const totalCheckedIn = data.reduce((acc, r) => acc + Number(r.checked_in || 0), 0);
      const totalAvailable = data.reduce((acc, r) => acc + Number(r.available || 0), 0);
      setStats({ totalEvents, totalCapacity, totalSold, totalCheckedIn, totalAvailable });
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  const pct = (n, total) => total > 0 ? Math.round((100 * n) / total) : 0;

  const create = async (e) => {
    e.preventDefault();
    setErr('');
    setSuccess('');
    try {
      await api('/events', {
        method: 'POST',
        body: { ...f, capacity: +f.capacity, price: +f.price },
      });
      setSuccess('Evento creado correctamente');
      setF({ name: '', venue: '', starts_at: '', capacity: 100, price: 0, description: '' });
      load();
    } catch (x) {
      setErr(x.message);
    }
  };

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const inp = 'block w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition';

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Dashboard de Aforo</h1>
            <p className="text-slate-500">Monitoreo en tiempo real de todos los eventos</p>
          </div>
          <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold animate-pulse">
            <span className="w-2 h-2 bg-green-600 rounded-full" /> En vivo
          </span>
        </div>

        {/* Estadísticas globales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Eventos</p>
                <p className="text-3xl font-bold text-indigo-600">{stats?.totalEvents ?? 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Cupos totales</p>
                <p className="text-3xl font-bold text-indigo-600">{stats?.totalCapacity ?? 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Boletos vendidos</p>
                <p className="text-3xl font-bold text-green-600">{stats?.totalSold ?? 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.048A7.002 7.002 0 003 12c0 1.842.748 3.472 1.826 4.751A11.97 11.97 0 004.049 16a7 7 0 001.043-1.31l.096-.12a7 7 0 001.073-1.253c.2-.235.339-.488.457-.736A11.975 11.975 0 0112 16a11.975 11.975 0 017.04-2.057c.204.321.323.642.418.973.051.18.123.359.206.577A11.99 11.99 0 0112 20a11.99 11.99 0 01-7.04-2.057c.211-.47.381-.964.487-1.437l.039-.173c.186-.79.292-1.617.292-2.51A11.955 11.955 0 0112 2.944z" /></svg>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Ingresados</p>
                <p className="text-3xl font-bold text-blue-600">{stats?.totalCheckedIn ?? 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Disponibles</p>
                <p className="text-3xl font-bold text-slate-600">{stats?.totalAvailable ?? 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de eventos con aforo */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Estado de los eventos</h2>
          <p className="text-sm text-slate-500">Actualizado cada 5 segundos</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                <th className="px-6 py-3 font-semibold">Evento</th>
                <th className="px-6 py-3 font-semibold">Lugar · Fecha</th>
                <th className="px-6 py-3 font-semibold text-right">Capacidad</th>
                <th className="px-6 py-3 font-semibold text-right">Vendidos</th>
                <th className="px-6 py-3 font-semibold text-right">Ingresados</th>
                <th className="px-6 py-3 font-semibold text-right">Disponibles</th>
                <th className="px-6 py-3 font-semibold">Aforo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => {
                const total = Number(r.capacity || 0);
                const available = Number(r.available || 0);
                const sold = Number(r.sold || 0);
                const checkedIn = Number(r.checked_in || 0);
                const fillPct = total > 0 ? Math.round((100 * sold) / total) : 0;
                const fillColor = fillPct >= 90 ? 'bg-red-500' : fillPct >= 70 ? 'bg-yellow-500' : 'bg-green-500';
                return (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{r.name}</div>
                      <p className="text-xs text-slate-500">{r.id}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div>{r.venue}</div>
                      <div className="text-xs text-slate-400">{r.starts_at}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-700">{total}</td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-700">{sold}</td>
                    <td className="px-6 py-4 text-right font-semibold text-green-600">{checkedIn}</td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-600">{available}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${fillColor}`} style={{ width: `${fillPct}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-600">{fillPct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    No hay eventos creados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Crear evento */}
      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Crear nuevo evento</h2>
        {err && <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{err}</p>}
        {success && <p className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg">{success}</p>}
        <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre del evento</label>
            <input
              className={inp}
              placeholder="Ej: Concierto de Rock"
              value={f.name}
              onChange={set('name')}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Lugar</label>
            <input className={inp} placeholder="Teatro Central" value={f.venue} onChange={set('venue')} />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Descripción</label>
            <input className={inp} placeholder="Breve descripción del evento" value={f.description} onChange={set('description')} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Fecha y hora</label>
            <input className={inp} type="datetime-local" value={f.starts_at} onChange={set('starts_at')} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Capacidad</label>
            <input className={inp} type="number" min="1" placeholder="100" value={f.capacity} onChange={set('capacity')} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Precio</label>
            <input className={inp} type="number" min="0" placeholder="0" value={f.price} onChange={set('price')} />
          </div>
          <div className="lg:col-span-3 flex gap-3">
            <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-500 transition shadow-lg">
              Crear evento
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
