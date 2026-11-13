import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../api';

const badge = {
  VALID: 'bg-emerald-100 text-emerald-700',
  USED: 'bg-slate-200 text-slate-600',
  CANCELLED: 'bg-rose-100 text-rose-700',
};
const badgeText = {
  VALID: 'VÁLIDO — sin usar',
  USED: 'USADO — ya ingresó',
  CANCELLED: 'CANCELADO',
};

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setTickets(await api('/tickets/mine'));
    } finally {
      setLoading(false);
    }
  };

  // Carga al montar y se refresca cada 8 s para ver cambios de estado en vivo
  useEffect(() => {
    load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mis tickets</h1>
          <p className="text-sm text-slate-500">
            {loading ? 'Cargando…' : `${tickets.length} boleto${tickets.length !== 1 ? 's' : ''} · se actualiza automáticamente`}
          </p>
        </div>
        <button onClick={load} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-50">
          ↻ Actualizar
        </button>
      </div>

      {!tickets.length && !loading && (
        <div className="text-center py-16 bg-white rounded-2xl shadow border border-slate-200">
          <p className="text-slate-500 mb-4">Aún no tienes tickets.</p>
          <a href="/" className="text-slate-700 font-semibold hover:underline">Ver eventos →</a>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-5">
        {tickets.map((t) => (
          <div key={t.code} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 text-center">
            <QRCodeSVG value={t.code} size={140} className="mx-auto" />
            <h2 className="font-bold mt-3 text-slate-800">{t.event_name}</h2>
            <p className="text-sm text-slate-500">{t.venue}</p>
            <p className="text-xs text-slate-400 mb-2">
              {new Date(t.starts_at).toLocaleDateString('es-CO')}
            </p>
            <p className="text-[10px] break-all my-2 font-mono bg-slate-50 rounded p-2 text-slate-600">{t.code}</p>
            <span className={`inline-block text-xs px-3 py-1 rounded-full font-bold ${badge[t.status]}`}>
              {badgeText[t.status] || t.status}
            </span>
            {t.status === 'USED' && t.checked_in_at && (
              <p className="text-xs text-slate-400 mt-2">Ingresó: {t.checked_in_at}</p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
