import { useEffect, useRef, useState } from 'react';
import { api } from '../api';

// Módulo de check-in: escanear/pegar el código y validar. Muestra siempre
// los datos completos del ticket para no tener dudas de cuál se validó.
export default function Checkin() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState('');
  const ref = useRef();

  useEffect(() => { ref.current?.focus(); }, [result]);
  useEffect(() => { api('/events').then(setEvents).catch(() => {}); }, []);

  const validate = async (e) => {
    e.preventDefault();
    try {
      const r = await api('/tickets/checkin', {
        method: 'POST',
        body: { code: code.trim(), eventId: eventId || undefined },
      });
      setResult({ ok: true, ...r });
    } catch (x) {
      setResult({ ok: false, text: x.message });
    }
    setCode('');
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Check-in</h1>
      <p className="text-slate-500 mb-6">Valida el acceso de los asistentes en la entrada</p>

      {/* Filtro opcional por evento */}
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Evento (opcional)</label>
      <select value={eventId} onChange={(e) => setEventId(e.target.value)}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4 bg-white focus:ring-2 focus:ring-emerald-500 outline-none">
        <option value="">Todos los eventos</option>
        {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
      </select>

      <form onSubmit={validate} className="flex gap-2">
        <input ref={ref} value={code} onChange={(e) => setCode(e.target.value)}
          placeholder="Código del ticket (UUID)"
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
        <button className="bg-slate-800 text-white px-5 rounded-lg font-bold hover:bg-slate-700 transition">
          Validar
        </button>
      </form>

      {result && result.ok && result.ticket && (
        <div className="mt-6 bg-emerald-600 text-white rounded-xl p-6 shadow-lg shadow-emerald-500/30">
          <div className="text-center text-2xl font-bold mb-4">✔ ACCESO PERMITIDO</div>
          <div className="bg-white/10 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="opacity-75">Ticket:</span><span className="font-mono font-semibold">{result.ticket.code.slice(0, 8)}…</span></div>
            <div className="flex justify-between"><span className="opacity-75">Evento:</span><span className="font-semibold">{result.ticket.event}</span></div>
            <div className="flex justify-between"><span className="opacity-75">Estado:</span><span className="font-semibold">{result.ticket.status}</span></div>
            <div className="flex justify-between"><span className="opacity-75">Hora:</span><span className="font-semibold">{result.ticket.checked_in_at}</span></div>
          </div>
        </div>
      )}

      {result && !result.ok && (
        <div className="mt-6 bg-rose-600 text-white rounded-xl p-6 text-center text-xl font-bold shadow-lg shadow-rose-500/30">
          ✖ {result.text}
        </div>
      )}
    </div>
  );
}
