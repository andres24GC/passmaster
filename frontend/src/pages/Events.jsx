import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';

// Imágenes locales (SVG) — no dependen de internet
const getImage = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('concierto') || n.includes('apertura') || n.includes('rock')) return '/events/concierto.svg';
  if (n.includes('jazz')) return '/events/jazz.svg';
  if (n.includes('teatro') || n.includes('obra')) return '/events/teatro.svg';
  if (n.includes('conferencia') || n.includes('tech')) return '/events/conferencia.svg';
  if (n.includes('futbol') || n.includes('fútbol') || n.includes('partido')) return '/events/futbol.svg';
  if (n.includes('arte') || n.includes('exposici')) return '/events/arte.svg';
  return '/events/concierto.svg';
};

// Tarjetas de prueba del sandbox (token -> resultado en backend)
const TEST_CARDS = [
  { num: '4242424242424242', token: 'tok_visa', brand: 'Visa', label: '4242 4242 4242 4242 (aprobada)' },
  { num: '4444444444444444', token: 'tok_mastercard', brand: 'Mastercard', label: '4444 4444 4444 4444 (aprobada)' },
  { num: '37828224631005', token: 'tok_amex', brand: 'Amex', label: '3782 822463 1005 (aprobada)' },
  { num: '4000000000000002', token: 'tok_declined', brand: 'Visa', label: '4000 0000 0000 0002 (rechazada)' },
  { num: '4000000000009995', token: 'tok_funds', brand: 'Visa', label: '4000 0000 0000 9995 (sin fondos)' },
  { num: '4000000000000069', token: 'tok_expired', brand: 'Visa', label: '4000 0000 0000 0069 (expirada)' },
  { num: '4000000000000119', token: 'tok_fraud', brand: 'Visa', label: '4000 0000 0000 0119 (fraude)' },
];

const money = (n) => Number(n).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

export default function Events() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [events, setEvents] = useState([]);
  const [sel, setSel] = useState(null);          // evento en compra
  const [qty, setQty] = useState(1);
  const [card, setCard] = useState({ number: '', name: '', exp: '', cvc: '' });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState(null);  // recibo de pago exitoso

  const load = () => api('/events').then(setEvents).catch(() => setEvents([]));
  useEffect(() => { load(); }, []);

  // Formatea el número de tarjeta: 4242 4242 4242 4242
  const onCardNumber = (v) =>
    setCard({ ...card, number: v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim() });

  // Vencimiento automático MM/AA
  const onExp = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    setCard({ ...card, exp: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d });
  };

  const fillCard = (num) => setCard({ ...card, number: num.replace(/(.{4})/g, '$1 ').trim() });

  // Flujo de pago: 1) validar datos 2) reservar cupos 3) cobrar con la pasarela
  const buy = async () => {
    setMsg(null);
    const digits = card.number.replace(/\s/g, '');
    const found = TEST_CARDS.find((c) => c.num === digits);
    if (!found) return setMsg('Número de tarjeta no válido. Usa una de las tarjetas de prueba de abajo.');
    if (!card.name.trim()) return setMsg('Ingresa el nombre del titular.');
    if (!/^\d{2}\/\d{2}$/.test(card.exp)) return setMsg('Vencimiento inválido. Usa el formato MM/AA.');
    if (!/^\d{3,4}$/.test(card.cvc)) return setMsg('CVC inválido (3 o 4 dígitos).');

    setBusy(true);
    try {
      const order = await api('/orders', { method: 'POST', body: { eventId: sel.id, quantity: qty } });
      const result = await api(`/orders/${order.id}/pay`, { method: 'POST', body: { paymentToken: found.token } });
      setReceipt(result.receipt || null);
      setSel(null);
      setCard({ number: '', name: '', exp: '', cvc: '' });
    } catch (e) { setMsg(e.message); load(); }
    setBusy(false);
  };

  const canBuy = user?.role === 'customer';

  return (
    <>
      {/* Hero — tono slate oscuro, sin azul */}
      <section className="bg-slate-900 text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1533155820116-7d9a2b6f624e?w=1600&q=80')] bg-cover bg-center" />
        <div className="relative max-w-5xl mx-auto z-10">
          <span className="inline-block bg-slate-700 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            PassMaster • Ticketing de Eventos
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Boletos digitales con código único y QR
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl">
            Compra boletos, genera tickets con identificador único y controla el acceso en tiempo real.
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
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">
              {events.length} evento{events.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Eventos — tarjetas de igual altura, botón pegado al fondo (mt-auto) */}
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
                <p className="text-sm text-slate-500 mb-4">Crea uno desde el <a href="/admin" className="text-slate-600 hover:underline font-medium">Dashboard</a>.</p>
              )}
              {user?.role === 'staff' && (
                <p className="text-sm text-slate-500 mb-4">Espera a que el administrador cree eventos.</p>
              )}
            </div>
          ) : (
            events.map((e) => {
              const available = Number(e.available || 0);
              const pct = e.capacity ? Math.min(100, Math.round(((e.capacity - available) / e.capacity) * 100)) : 0;

              return (
                <div key={e.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition duration-300 flex flex-col">
                  {/* Imagen local del evento — altura fija */}
                  <div className="h-52 relative overflow-hidden bg-slate-100">
                    <img
                      src={getImage(e.name)}
                      alt={e.name}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute top-3 left-3 z-10">
                      <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                        available > 0 ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
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

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-lg text-slate-800 leading-tight mb-2">{e.name}</h3>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{e.description}</p>

                    <div className="space-y-2 mb-4">
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
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Disponibles: {available}</span>
                        <span>Vendidos: {e.sold || 0}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-slate-600 transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    {/* mt-auto empuja el botón al fondo: todas las tarjetas quedan alineadas */}
                    <button
                      disabled={!canBuy || available <= 0 || busy}
                      onClick={() => canBuy ? (setSel(e), setQty(1), setMsg(null)) : nav('/login')}
                      className={`mt-auto w-full py-3.5 rounded-xl font-bold text-white transition-all duration-200 ${
                        !canBuy
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : available <= 0
                            ? 'bg-rose-100 text-rose-500 cursor-not-allowed'
                            : 'bg-slate-800 hover:bg-slate-700 hover:shadow-lg'
                      }`}
                    >
                      {!canBuy ? 'Inicia sesión para comprar' : available <= 0 ? 'Agotado' : 'Comprar boletos'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Recibo de pago exitoso */}
        {receipt && (
          <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-emerald-800 mb-1">¡Pago aprobado!</h3>
                <p className="text-sm text-emerald-700">Tu pago fue procesado y se generaron tus boletos con código único.</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-white rounded-lg border border-slate-100 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Referencia:</span>
                <span className="font-mono text-emerald-600 font-semibold">{receipt.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Evento:</span>
                <span className="font-semibold">{receipt.eventName || '—'} × {receipt.quantity || qty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Método:</span>
                <span className="font-semibold">{receipt.paymentMethod?.card?.brand} · •••• {receipt.paymentMethod?.card?.last4}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-600">Total:</span>
                <span className="text-emerald-600">{money(receipt.amount)}</span>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500">Ve a <a href="/tickets" className="text-slate-600 hover:underline font-medium">Mis tickets</a> para ver tus boletos con QR.</p>
          </div>
        )}
      </div>

      {/* Modal de compra — con formulario de tarjeta */}
      {sel && (
        <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto" onClick={() => setSel(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative my-4" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSel(null)} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition">✕</button>

            <div className="h-32 bg-slate-100 rounded-xl overflow-hidden mb-4">
              <img src={getImage(sel.name)} alt={sel.name} className="w-full h-full object-cover" />
            </div>

            <h3 className="font-bold text-xl text-slate-800 mb-1">{sel.name}</h3>
            <p className="text-sm text-slate-500 mb-4">{sel.venue} · {new Date(sel.starts_at).toLocaleDateString('es-CO')}</p>

            {/* Cantidad */}
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cantidad de boletos</label>
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1}
                className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-slate-50 disabled:opacity-50">−</button>
              <input type="number" min="1" max={Math.min(10, Number(sel.available || 0))} value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(10, Number(e.target.value || 1))))}
                className="w-16 border rounded-lg px-2 text-center font-semibold" />
              <button onClick={() => setQty(Math.min(10, qty + 1))} disabled={qty >= Math.min(10, Number(sel.available || 0))}
                className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-slate-50 disabled:opacity-50">+</button>
            </div>

            {/* Formulario de tarjeta (tokenización simulada) */}
            <div className="border-t border-slate-200 pt-4 mb-4">
              <p className="text-sm font-semibold text-slate-700 mb-2">Datos de la tarjeta</p>

              <label className="block text-xs text-slate-500 mb-1">Número de tarjeta</label>
              <input value={card.number} onChange={(e) => onCardNumber(e.target.value)} inputMode="numeric"
                placeholder="4242 4242 4242 4242"
                className="w-full border rounded-lg px-3 py-2 mb-3 font-mono text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />

              <label className="block text-xs text-slate-500 mb-1">Nombre del titular</label>
              <input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })}
                placeholder="ANDRES PEREZ"
                className="w-full border rounded-lg px-3 py-2 mb-3 uppercase text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Vencimiento</label>
                  <input value={card.exp} onChange={(e) => onExp(e.target.value)} inputMode="numeric"
                    placeholder="MM/AA"
                    className="w-full border rounded-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">CVC</label>
                  <input value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    inputMode="numeric" placeholder="123"
                    className="w-full border rounded-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-2">Rellena con una tarjeta de prueba:</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {TEST_CARDS.map((c) => (
                  <button key={c.num} type="button" onClick={() => fillCard(c.num)}
                    className="text-xs px-2 py-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-600">
                    {c.brand} {c.num.slice(-4)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between text-sm font-bold mb-4 pt-3 border-t border-slate-100">
              <span className="text-slate-600">Total a pagar:</span>
              <span className="text-slate-800 text-lg">{money(sel.price * qty)}</span>
            </div>

            {msg && <p className="text-rose-600 text-sm mb-4">{msg}</p>}

            <div className="flex gap-3">
              <button onClick={buy} disabled={busy}
                className="flex-1 bg-emerald-600 text-white py-3.5 rounded-xl font-bold disabled:opacity-50 hover:bg-emerald-500 transition shadow-lg">
                {busy ? 'Procesando pago…' : 'Pagar ahora'}
              </button>
              <button onClick={() => setSel(null)}
                className="flex-1 border border-slate-300 py-3.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
