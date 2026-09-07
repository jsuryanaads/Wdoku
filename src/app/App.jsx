import { useEffect, useState } from 'react';
import { Eye, EyeOff, LogOut, Wallet, Home, ArrowDownLeft, ArrowUpRight, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import HomePage from '../features/home/HomePage';
import '../styles/globals.css';

function AuthPage() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault(); setLoading(true); setMessage('');
    const result = mode === 'login' ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password });
    if (result.error) setMessage(result.error.message);
    else if (mode === 'register' && !result.data.session) setMessage('Akun berhasil dibuat. Periksa email untuk konfirmasi.');
    setLoading(false);
  }

  async function forgot() {
    if (!email) return setMessage('Masukkan email terlebih dahulu.');
    setLoading(true); setMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}` });
    setMessage(error ? error.message : 'Link reset password telah dikirim ke email Anda.'); setLoading(false);
  }

  return <main className="auth-page"><div className="auth-card"><div className="brand-mark"><Wallet size={24}/></div><h1>WDOKU</h1><p className="auth-subtitle">Personal Finance</p><form onSubmit={submit}><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" /></label><label>Password<div className="password-input"><input type={showPassword ? 'text' : 'password'} value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} autoComplete={mode==='login'?'current-password':'new-password'} /><button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label="Tampilkan password">{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>{mode==='login'&&<button className="forgot" type="button" onClick={forgot}>Lupa password?</button>}<button className="primary-button" disabled={loading}>{loading?'MEMPROSES...':mode==='login'?'MASUK':'DAFTAR'}</button></form>{message&&<div className="alert">{message}</div>}<p className="auth-switch">{mode==='login'?'Belum punya akun?':'Sudah punya akun?'} <button onClick={()=>{setMode(mode==='login'?'register':'login');setMessage('')}}>{mode==='login'?'Daftar':'Masuk'}</button></p></div></main>;
}

const nav = [{label:'Beranda', icon:Home, key:'home'}, {label:'Pemasukan', icon:ArrowDownLeft, key:'income'}, {label:'Pengeluaran', icon:ArrowUpRight, key:'expense'}, {label:'Pengaturan', icon:Settings, key:'settings'}];
function Shell({ user, onSignOut }) {
  const [page, setPage] = useState('home');
  return <div className="app-shell"><aside className="sidebar"><div className="sidebar-brand"><Wallet size={22}/><span>WDOKU</span></div><nav>{nav.map(({label,icon:Icon,key})=><button className={page===key?'nav-item active':'nav-item'} onClick={()=>setPage(key)} key={key}><Icon size={19}/><span>{label}</span></button>)}</nav><button className="nav-item signout" onClick={onSignOut}><LogOut size={19}/><span>Keluar</span></button></aside><main className="main-area">{page==='home'?<HomePage user={user}/>:<div className="page-content"><section className="panel empty-state"><strong>Modul {nav.find(n=>n.key===page)?.label || 'ini'}</strong><span>Bagian ini akan dikembangkan pada tahap berikutnya.</span></section></div>}</main><nav className="mobile-navigation">{nav.slice(0,3).map(({label,icon:Icon,key})=><button className={page===key?'mobile-nav-item active':'mobile-nav-item'} onClick={()=>setPage(key)} key={key}><Icon size={20}/><span>{label}</span></button>)}<button className="mobile-nav-item" onClick={onSignOut}><LogOut size={20}/><span>Keluar</span></button></nav></div>;
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { supabase.auth.getSession().then(({data})=>{setSession(data.session);setLoading(false)}); const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>setSession(next)); return ()=>subscription.unsubscribe(); }, []);
  if (loading) return <div className="app-loading">Memuat Wdoku...</div>;
  if (!session) return <AuthPage/>;
  return <Shell user={session.user} onSignOut={()=>supabase.auth.signOut()}/>;
}
