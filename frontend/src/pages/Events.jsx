import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';

const EVENT_IMAGES = [
  'https://images.unsplash.com/photo-1459749411477-64901fa7790e?w=600&q=80',
  'https://images.unsplash.com/photo-1514519774440-3e134950f925?w=600&q=80',
  'https://images.unsplash.com/photo-1517694691331-4d5e5a1e1f4e?w=600&q=80',
  'https://images.unsplash.com/photo-1535102908407-7e73941c2c48?w=600&q=80',
  'https://images.unsplash.com/photo-1461896836736-2de47fd90c49?w=600&q=80',
  'https://images.unsplash.com/photo-1579783930042-2ee0759d0a06?w=600&q=80',
];

const money = (n) => Number(n).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

export default function Events() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [events, setEvents] = useState([]);
  const [sel, setSel] = useState(null);
  const [qty, setQty] = useState(1);
  const [token, setToken] = useState('tok_visa');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => api('/events').then(setEvents).catch(() => setEvents([]));
  useEffect(() => { load(); }, []);

  const buy = async () => {
    setBusy(true); setMsg(null);
    try {
      const order = await api('/orders', { method: 'POST', body: { eventId: sel.id, quantity: qty } });
      await api(`/orders/${order.id}/pay`, { method: 'POST', body: { paymentToken: token } });
      nav('/tickets');
    } catch (e) { setMsg(e.message); load(); }
    setBusy(false);
  };

  const canBuy = user?.role === 'customer';

  return (
    <>
      {/* Hero */}
      <section className="bg-indigo-700 text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[url('https://images.unsplash.com/photo-1533155820116-7d9a2b6f624e?w=1600&q=80')] bg-cover bg-center" />
        <div className="relative max-w-5xl mx-auto z-10">
          <span className="inline-block bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            PassMaster • Ticketing de Eventos
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Compra boletos digitales con código único
          </h1>
          <p className="text-indigo-100 text-lg max-w-2xl">
            Genera tickets con QR, controla el acceso en tiempo real y evita sobreventa.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Próximos eventos</h2>
            <p className="text-slate-500">Elige un evento y compra tus boletos</p>
          </div>
          {events.length > 0 && (
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold">
              {events.length} evento{events.length !== 1 ? 's' : ''} disponible{events.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Eventos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length === 0 ? (
            <div className="col-span-3 flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow border border-slate-200">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No hay eventos disponibles</h3>
              {user?.role === 'admin' && (
                <p className="text-sm text-slate-500 mb-4">Crea tu primer evento desde el <a href="/admin" className="text-indigo-600 hover:underline font-medium">Dashboard</a>.</p>
              )}
              {user?.role === 'staff' && (
                <p className="text-sm text-slate-500 mb-4">Espera a que el administrador cree eventos.</p>
              )}
            </div>
          ) : (
            events.map((e, idx) => {
              const img = EVENT_IMAGES[idx % EVENT_IMAGES.length];
              const available = Number(e.available || 0);
              const pct = e.capacity ? Math.min(100, Math.round(((e.capacity - available) / e.capacity) * 100)) : 0;

              return (
                <div key={e.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition duration-300 flex flex-col h-full">
                  {/* Imagen del evento */}
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src={img}
                      alt={e.name}
                      className="w-full h-full object-cover object-center"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1533155820116-7d9a2b6f624e?w=600&q=80'; }}
                    />
                    <div className="absolute top-3 left-3 z-10">
                      <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                        available > 0 ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {available > 0 ? 'Disponible' : 'Agotado'}
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3 z-10 bg-white/90 backdrop-blur-sm">
                      <span className="px-2 py-1 rounded text-xs font-bold text-slate-800">
                        {money(e.price)}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg text-slate-800 leading-tight">{e.name}</h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{e.description}</p>

                    <div className="space-y-2 mb-5">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="text-slate-400" aria-hidden="true">📍</span>
                        <span>{e.venue}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="text-slate-400" aria-hidden="true">📅</span>
                        <span>{new Date(e.starts_at).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="text-slate-400" aria-hidden="true">🎫</span>
                        <span>Capacidad: {e.capacity}</span>
                      </div>
                    </div>

                    {/* Barra de aforo */}
                    <div className="mb-5">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Disponibles: {available}</span>
                        <span>Vendidos: {e.sold || 0}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Botón de compra (solo clientes) */}
                    <button
                      disabled={!canBuy || available <= 0 || busy}
                      onClick={() => canBuy ? (setSel(e), setQty(1), setMsg(null)) : nav('/login')}
                      className={`w-full py-3.5 rounded-xl font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                        !canBuy
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : available <= 0
                            ? 'bg-red-100 text-red-500 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-lg'
                      }`}
                    >
                      {!canBuy ? (
                        <>
                          <span className="text-xs opacity-70">Inicia sesión</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055zM5 13h14M5 13h.01M21 13h.01M5 7h.01M21 7h.01" /></svg>
                        </>
                      ) : available <= 0 ? (
                        'Agotado'
                      ) : (
                        'Comprar boletos'
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal de compra */}
      {sel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSel(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative mx-2 md:mx-0" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSel(null)} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition">
              ✕
            </button>

            <div className="h-32 bg-slate-100 rounded-xl overflow-hidden mb-4 flex items-center justify-center">
              <img
                src={EVENT_IMAGES[events.findIndex(e => e.id === sel.id) % EVENT_IMAGES.length]}
                alt={sel.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1533155820116-7d9a2b6f624e?w=600&q=80'; }}
              />
            </div>

            <h3 className="font-bold text-xl text-slate-800 mb-1">{sel.name}</h3>
            <p className="text-sm text-slate-500 mb-5">
              {sel.venue} · {new Date(sel.starts_at).toLocaleDateString('es-CO')}
            </p>

            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cantidad de boletos</label>
            <div className="flex items-center gap-2 mb-5">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                disabled={qty <= 1}
                className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-slate-50 disabled:opacity-50"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                max={Math.min(10, Number(sel.available || 0))}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(10, Number(e.target.value || 1))))}
                className="w-16 border rounded-lg px-2 text-center font-semibold"
              />
              <button
                onClick={() => setQty(Math.min(10, qty + 1))}
                disabled={qty >= Math.min(10, Number(sel.available || 0))}
                className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-slate-50 disabled:opacity-50"
              >
                +
              </button>
            </div>

            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tarjeta de prueba (sandbox)</label>
            <select value={token} onChange={(e) => setToken(e.target.value)} className="w-full border rounded-lg p-2.5 mb-5 bg-slate-50">
              <option value="tok_visa">4242 4242 4242 4242 (aprobada)</option>
              <option value="tok_declined">4000 0000 0000 0002 (rechazada)</option>
              <option value="tok_funds">4000 0000 0000 9995 (sin fondos)</option>
            </select>

            <div className="mb-5">
              <div className="flex justify-between text-sm text-slate-600 mb-1">
                <span>Subtotal:</span>
                <span className="font-bold">{money(sel.price * qty)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Impuestos:</span>
                <span>Incluidos</span>
              </div>
            </div>

            {msg && <p className="text-red-600 text-sm mb-4">{msg}</p>}

            <div className="flex gap-3">
              <button
                onClick={buy}
                disabled={busy}
                className="flex-1 bg-green-600 text-white py-3.5 rounded-xl font-bold disabled:opacity-50 hover:bg-green-500 transition"
              >
                {busy ? 'Procesando…' : 'Pagar boletos'}
              </button>
              <button onClick={() => setSel(null)} className="flex-1 border border-slate-300 py-3.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
