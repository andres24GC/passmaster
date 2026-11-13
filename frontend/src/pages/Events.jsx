import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';

const EVENT_IMAGES = [
  'https://images.unsplash.com/photo-1459749411477-64901fa7790e?w=800&q=80', // concierto
  'https://images.unsplash.com/photo-1514519774440-3e134950f925?w=800&q=80', // jazz
  'https://images.unsplash.com/photo-1517694691331-4d5e5a1e1f4e?w=800&q=80', // teatro
  'https://images.unsplash.com/photo-1535102908407-7e73941c2c48?w=800&q=80', // conferencia
  'https://images.unsplash.com/photo-1461896836736-2de47fd90c49?w=800&q=80', // fútbol
  'https://images.unsplash.com/photo-1579783930042-2ee0759d0a06?w=800&q=80', // arte
];

const money = (n) => Number(n).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

export default function Events() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [events, setEvents] = useState([]);
  const [sel, setSel] = useState(null);       // evento en compra
  const [qty, setQty] = useState(1);
  const [token, setToken] = useState('tok_visa');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => api('/events').then(setEvents);
  useEffect(() => { load(); }, []);

  // Flujo de pago: 1) reservar cupos (POST /orders)  2) cobrar (POST /orders/:id/pay)
  const buy = async () => {
    setBusy(true); setMsg(null);
    try {
      const order = await api('/orders', { method: 'POST', body: { eventId: sel.id, quantity: qty } });
      await api(`/orders/${order.id}/pay`, { method: 'POST', body: { paymentToken: token } });
      nav('/tickets');
    } catch (e) { setMsg(e.message); load(); }
    setBusy(false);
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-indigo-700 text-white py-12 rounded-xl overflow-hidden relative">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1533155820116-7d9a2b6f624e?w=1600&q=80')] bg-cover bg-center" />
        <div className="relative max-w-5xl mx-auto px-4 z-10">
          <span className="inline-block bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            PassMaster • Ticketing de Eventos
          </span>
          <h1 className="text-4xl font-bold mb-4">Compra tus boletos digitales</h1>
          <p className="text-indigo-100 text-lg max-w-2xl">
            Crea eventos, genera tickets con código único y controla el acceso en tiempo real.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          🎟️ Próximos eventos
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {events.length === 0 ? (
            <div className="col-span-3 text-center py-20 bg-white rounded-2xl shadow border border-slate-200">
              <p className="text-slate-400 text-lg">No hay eventos disponibles aún.</p>
              {user?.role === 'admin' && (
                <p className="text-sm text-slate-500 mt-2">Crea uno desde el <a href="/admin" className="text-indigo-600 hover:underline">Dashboard</a>.</p>
              )}
            </div>
          ) : (
            events.map((e, idx) => {
              const img = EVENT_IMAGES[idx % EVENT_IMAGES.length];
              const available = Number(e.available || 0);
              const pct = e.capacity ? Math.round(((e.capacity - available) / e.capacity) * 100) : 0;
              return (
                <div key={e.id} className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden hover:shadow-xl transition duration-300 flex flex-col">
                  <div className="h-48 bg-slate-100 relative overflow-hidden">
                    <img src={img} alt={e.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">
                      {e.capacity > 0 ? 'Disponible' : 'Agotado'}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur text-slate-700 text-sm font-bold px-2 py-1 rounded">
                      {money(e.price)}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg text-slate-800 leading-tight">{e.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        available > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {available > 0 ? `${available} cupos` : 'Agotado'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{e.description}</p>
                    <div className="mb-4 text-sm text-slate-600 space-y-1">
                      <p><span className="font-semibold text-slate-800">📍</span> {e.venue}</p>
                      <p><span className="font-semibold text-slate-800">📅</span> {new Date(e.starts_at).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <p><span className="font-semibold text-slate-800">🎫</span> Capacidad: {e.capacidad || e.capacity}</p>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
                      <div className={`h-full bg-indigo-600 transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                    <button
                      disabled={!available || !user}
                      onClick={() => user ? (setSel(e), setQty(1), setMsg(null)) : nav('/login')}
                      className={`w-full py-3 rounded-xl font-bold text-white transition disabled:opacity-50 ${
                        !available || !user
                          ? 'bg-slate-300 text-slate-500'
                          : 'bg-indigo-600 hover:bg-indigo-500'
                      }`}
                    >
                      {user ? (available ? 'Comprar boletos' : 'Agotado') : 'Inicia sesión para comprar'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal de compra */}
        {sel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSel(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSel(null)} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600">
                ✕
              </button>
              <img src={EVENT_IMAGES[events.findIndex(e => e.id === sel.id) % EVENT_IMAGES.length]} alt={sel.name} className="w-full h-32 object-cover rounded-xl mb-4" />
              <h3 className="font-bold text-xl text-slate-800 mb-2">{sel.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{sel.venue} · {new Date(sel.starts_at).toLocaleDateString('es-CO')}</p>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Cantidad de boletos</label>
              <input type="number" min="1" max={Math.min(10, Number(sel.available || 0))} value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="w-full border rounded p-2 mb-4 text-center" />
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tarjeta de prueba (sandbox)</label>
              <select value={token} onChange={(e) => setToken(e.target.value)} className="w-full border rounded p-2 mb-4">
                <option value="tok_visa">4242 4242 4242 4242 (aprobada)</option>
                <option value="tok_declined">4000 0000 0000 0002 (rechazada)</option>
                <option value="tok_funds">4000 0000 0000 9995 (sin fondos)</option>
              </select>
              <p className="font-bold text-lg mb-4">Total: {money(sel.price * qty)}</p>
              {msg && <p className="text-red-600 text-sm mb-3">{msg}</p>}
              <div className="flex gap-3">
                <button onClick={buy} disabled={busy} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold disabled:opacity-50">
                  {busy ? 'Procesando…' : 'Pagar boletos'}
                </button>
                <button onClick={() => setSel(null)} className="flex-1 border rounded py-3 font-bold text-slate-600 hover:bg-slate-50">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
