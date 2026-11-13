import { useEffect, useRef, useState } from 'react';
import { api } from '../api';

// Módulo de check-in: pegar/escanear (lector USB tipo teclado) el código y validar.
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
      <h1 className="text-2xl font-bold mb-4">Check-in</h1>
      <form onSubmit={validate} className="flex gap-2">
        <input ref={ref} value={code} onChange={(e) => setCode(e.target.value)}
          placeholder="Código del ticket (UUID)" className="flex-1 border rounded p-2" />
        <button className="bg-indigo-600 text-white px-4 rounded">Validar</button>
      </form>
      {result && (
        <div className={`mt-6 p-6 rounded text-center text-xl font-bold text-white ${result.ok ? 'bg-green-600' : 'bg-red-600'}`}>
          {result.ok ? '✔ ' : '✖ '}{result.text}
        </div>
      )}
    </div>
  );
}
