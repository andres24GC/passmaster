import { useEffect, useState } from 'react';
import { api } from '../api';

// Aforo en tiempo real: se refresca cada 5 s mediante polling.
export default function Dashboard() {
  const [rows, setRows] = useState([]);
  const [f, setF] = useState({ name: '', venue: '', starts_at: '', capacity: 100, price: 0, description: '' });
  const [err, setErr] = useState('');
  const load = () => api('/admin/dashboard').then(setRows).catch((e) => setErr(e.message));

  useEffect(() => { load(); const id = setInterval(load, 5000); return () => clearInterval(id); }, []);

  const create = async (e) => {
    e.preventDefault(); setErr('');
    try {
      await api('/events', { method: 'POST', body: { ...f, capacity: +f.capacity, price: +f.price } });
      setF({ ...f, name: '', description: '' }); load();
    } catch (x) { setErr(x.message); }
  };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const inp = 'border rounded p-2';

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Dashboard de aforo <span className="text-xs text-green-600">● en vivo</span></h1>
      <div className="space-y-3 mb-8">
        {rows.map((r) => {
          const pct = (n) => `${(100 * n) / r.capacity}%`;
          return (
            <div key={r.id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between"><b>{r.name}</b><span className="text-sm text-slate-500">{r.venue} · {r.starts_at}</span></div>
              <div className="h-4 bg-slate-200 rounded overflow-hidden flex my-2">
                <div className="bg-indigo-600" style={{ width: pct(r.checked_in) }} title="Ingresados" />
                <div className="bg-indigo-300" style={{ width: pct(r.pending_entry) }} title="Vendidos sin ingresar" />
              </div>
              <p className="text-sm">Capacidad <b>{r.capacity}</b> · Vendidos <b>{r.sold}</b> · Ingresados <b>{r.checked_in}</b> ·
                Por ingresar <b>{r.pending_entry}</b> · Disponibles <b>{r.available}</b></p>
            </div>
          );
        })}
      </div>
      <form onSubmit={create} className="bg-white p-4 rounded shadow grid md:grid-cols-2 gap-3">
        <h2 className="font-bold md:col-span-2">Crear evento</h2>
        <input className={inp} placeholder="Nombre" value={f.name} onChange={set('name')} />
        <input className={inp} placeholder="Lugar" value={f.venue} onChange={set('venue')} />
        <input className={inp} type="datetime-local" value={f.starts_at} onChange={set('starts_at')} />
        <input className={inp} type="number" min="1" placeholder="Capacidad" value={f.capacity} onChange={set('capacity')} />
        <input className={inp} type="number" min="0" placeholder="Precio" value={f.price} onChange={set('price')} />
        <input className={inp} placeholder="Descripción" value={f.description} onChange={set('description')} />
        {err && <p className="text-red-600 text-sm md:col-span-2">{err}</p>}
        <button className="bg-indigo-600 text-white rounded p-2 md:col-span-2">Crear</button>
      </form>
    </>
  );
}
