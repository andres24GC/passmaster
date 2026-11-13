import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';

export default function Login() {
  const { login, register } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try { await (mode === 'login' ? login(f) : register(f)); nav('/'); }
    catch (x) { setErr(x.message); }
  };
  const input = 'w-full border rounded p-2 mb-3';
  return (
    <form onSubmit={submit} className="bg-white max-w-sm mx-auto p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4">{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h1>
      {mode === 'register' && <input className={input} placeholder="Nombre" value={f.name} onChange={set('name')} />}
      <input className={input} type="email" placeholder="Email" value={f.email} onChange={set('email')} />
      <input className={input} type="password" placeholder="Contraseña (mín. 8)" value={f.password} onChange={set('password')} />
      {err && <p className="text-red-600 text-sm mb-3">{err}</p>}
      <button className="w-full bg-slate-800 text-white rounded-lg p-2 hover:bg-slate-700 transition">
        {mode === 'login' ? 'Entrar' : 'Registrarme'}
      </button>
      <button type="button" className="text-sm text-indigo-600 mt-3"
        onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErr(''); }}>
        {mode === 'login' ? '¿No tienes cuenta? Regístrate' : 'Ya tengo cuenta'}
      </button>
    </form>
  );
}
