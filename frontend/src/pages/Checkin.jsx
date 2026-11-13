import { useEffect, useRef, useState } from 'react';
import { api } from '../api';

export default function Checkin() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const ref = useRef();
  useEffect(() => ref.current?.focus(), [result]);

  const validate = async (e) => {
    e.preventDefault();
    try {
      const r = await api('/tickets/checkin', { method: 'POST', body: { code: code.trim() } });
      setResult({ ok: true, text: r.message });
    } catch (x) { setResult({ ok: false, text: x.message }); }
    setCode('');
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Check-in</h1>
      <p className="text-slate-500 mb-8">Valida el acceso de los asistentes en la entrada</p>
      <form onSubmit={validate} className="flex gap-2">
        <input ref={ref} value={code} onChange={(e) => setCode(e.target.value)}
          placeholder="Código del ticket (UUID)" className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition" />
        <button className="bg-slate-800 text-white px-4 rounded-lg font-bold hover:bg-slate-700 transition">
          Validar
        </button>
      </form>
      {result && (
        <div className={`mt-8 p-6 rounded-xl text-center text-xl font-bold text-white ${result.ok ? 'bg-emerald-600 shadow-lg shadow-emerald-500/30' : 'bg-rose-600 shadow-lg shadow-rose-500/30'}`}>
          {result.ok ? '✔ ' : '✖ '}{result.text}
        </div>
      )}
    </div>
  );
}
