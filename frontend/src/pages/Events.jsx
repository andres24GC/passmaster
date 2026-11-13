import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';

const TEST_CARDS = [
  ['tok_visa', '4242 4242 4242 4242 (aprobada)'],
  ['tok_declined', '4000 0000 0000 0002 (rechazada)'],
  ['tok_funds', '4000 0000 0000 9995 (sin fondos)'],
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
      <h1 className="text-2xl font-bold mb-4">Próximos eventos</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {events.map((e) => (
          <div key={e.id} className="bg-white p-4 rounded shadow">
            <h2 className="font-bold text-lg">{e.name}</h2>
            <p className="text-sm text-slate-500">{e.venue} · {e.starts_at}</p>
            <p className="my-2">{e.description}</p>
            <p className="font-semibold">{money(e.price)} · <span className={e.available ? 'text-green-600' : 'text-red-600'}>
              {e.available ? `${e.available} disponibles` : 'Agotado'}</span></p>
            <button disabled={!e.available} onClick={() => (user ? (setSel(e), setQty(1), setMsg(null)) : nav('/login'))}
              className="mt-3 bg-indigo-600 text-white px-4 py-1 rounded disabled:bg-slate-300">Comprar</button>
          </div>
        ))}
      </div>

      {sel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded p-6 w-full max-w-sm">
            <h3 className="font-bold mb-3">{sel.name}</h3>
            <label className="block text-sm">Cantidad</label>
            <input type="number" min="1" max={Math.min(10, sel.available)} value={qty}
              onChange={(e) => setQty(Number(e.target.value))} className="border rounded p-2 w-full mb-3" />
            <label className="block text-sm">Tarjeta de prueba (sandbox)</label>
            <select value={token} onChange={(e) => setToken(e.target.value)} className="border rounded p-2 w-full mb-3">
              {TEST_CARDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <p className="font-semibold mb-3">Total: {money(sel.price * qty)}</p>
            {msg && <p className="text-red-600 text-sm mb-2">{msg}</p>}
            <div className="flex gap-2">
              <button onClick={buy} disabled={busy} className="flex-1 bg-green-600 text-white rounded p-2 disabled:opacity-50">
                {busy ? 'Procesando…' : 'Pagar'}</button>
              <button onClick={() => setSel(null)} className="px-4 rounded border">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
