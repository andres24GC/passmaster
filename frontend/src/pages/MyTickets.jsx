import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../api';

const badge = { VALID: 'bg-green-100 text-green-700', USED: 'bg-slate-200 text-slate-600', CANCELLED: 'bg-red-100 text-red-700' };

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  useEffect(() => { api('/tickets/mine').then(setTickets); }, []);
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Mis tickets</h1>
      {!tickets.length && <p>Aún no tienes tickets.</p>}
      <div className="grid md:grid-cols-3 gap-4">
        {tickets.map((t) => (
          <div key={t.code} className="bg-white p-4 rounded shadow text-center">
            <QRCodeSVG value={t.code} size={140} className="mx-auto" />
            <h2 className="font-bold mt-2">{t.event_name}</h2>
            <p className="text-sm text-slate-500">{t.venue} · {t.starts_at}</p>
            <p className="text-[10px] break-all my-1">{t.code}</p>
            <span className={`text-xs px-2 py-0.5 rounded ${badge[t.status]}`}>{t.status}</span>
          </div>
        ))}
      </div>
    </>
  );
}
