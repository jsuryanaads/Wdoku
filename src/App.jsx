import { useEffect, useState } from 'react';
import { Archive, FileText, Folder, LayoutDashboard, LogIn, Mail, Menu, Search, Settings, UserRound, X } from 'lucide-react';
import { supabase } from './lib/supabase';

const menu = [
  ['Dashboard', LayoutDashboard],
  ['Dokumen', FileText],
  ['Kategori', Folder],
  ['Profil', UserRound],
  ['Pengaturan', Settings],
];

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState('Dashboard');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        setLoading(false);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) setSession(nextSession);
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  if (loading) return <div className="auth-loading">Memuat Wdoku...</div>;
  if (!session) return <Auth />;

  const email = session.user.email || 'Pengguna';
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand"><div className="brand-mark"><Archive size={21} /></div><div><strong>Wdoku</strong><span>Document Manager</span></div><button className="icon-btn mobile-only" onClick={() => setOpen(false)}><X size={20}/></button></div>
        <nav>{menu.map(([label, Icon]) => <button key={label} className={active === label ? 'nav-item active' : 'nav-item'} onClick={() => {setActive(label); setOpen(false)}}><Icon size={19}/><span>{label}</span></button>)}</nav>
        <div className="sidebar-bottom"><div className="user-mini"><div className="avatar">{initials}</div><div><strong>{email}</strong><span>Akun saya</span></div></div><button className="logout" onClick={() => supabase.auth.signOut()}><LogIn size={17}/> Keluar</button></div>
      </aside>
      {open && <div className="overlay" onClick={() => setOpen(false)} />}
      <main className="main">
        <header className="topbar"><button className="icon-btn mobile-menu" onClick={() => setOpen(true)}><Menu size={22}/></button><div><h1>{active}</h1><p>Kelola dokumen Anda dengan rapi dan aman.</p></div><div className="top-actions"><div className="search"><Search size={18}/><input placeholder="Cari dokumen..." /></div><div className="avatar">{initials}</div></div></header>
        <section className="content">{active === 'Dashboard' ? <Dashboard /> : <EmptyPage title={active} />}</section>
      </main>
    </div>
  );
}

function Auth() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function submit(event) {
    event.preventDefault();
    setBusy(true); setMessage('');
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    setBusy(false);
    if (result.error) return setMessage(result.error.message);
    if (mode === 'register' && !result.data.session) setMessage('Registrasi berhasil. Periksa email Anda untuk konfirmasi akun.');
  }

  return <div className="auth-page"><div className="auth-card"><div className="brand auth-brand"><div className="brand-mark"><Archive size={22}/></div><div><strong>Wdoku</strong><span>Document Manager</span></div></div><h1>{mode === 'login' ? 'Masuk ke Wdoku' : 'Buat akun Wdoku'}</h1><p className="auth-subtitle">{mode === 'login' ? 'Kelola dokumen pribadi Anda dengan aman.' : 'Mulai menyimpan dan mengelola dokumen Anda.'}</p><form onSubmit={submit}>{mode === 'register' && <label>Nama lengkap<input value={name} onChange={e => setName(e.target.value)} placeholder="Nama Anda" required /></label>}<label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@email.com" required /></label><label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimal 6 karakter" minLength={6} required /></label>{message && <div className="auth-message"><Mail size={16}/><span>{message}</span></div>}<button className="primary auth-submit" disabled={busy}>{busy ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar'}</button></form><button className="auth-switch" onClick={() => {setMode(mode === 'login' ? 'register' : 'login'); setMessage('')}}>{mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}</button></div></div>;
}

function Dashboard() { return <><div className="welcome"><div><span className="eyebrow">WDOKU v1.0</span><h2>Selamat datang di Wdoku</h2><p>Semua dokumen pribadi Anda, tersimpan dalam satu tempat.</p></div><button className="primary"><FileText size={18}/> Tambah Dokumen</button></div><div className="stats"><Stat label="Total Dokumen" value="0" icon={FileText}/><Stat label="Aktif" value="0" icon={Archive}/><Stat label="Draft" value="0" icon={Folder}/><Stat label="Arsip" value="0" icon={Archive}/></div><div className="panel"><div className="panel-head"><div><h3>Dokumen Terbaru</h3><p>Dokumen yang baru Anda tambahkan.</p></div><button className="ghost">Lihat semua</button></div><div className="empty"><div className="empty-icon"><FileText size={28}/></div><h3>Belum ada dokumen</h3><p>Tambahkan dokumen pertama Anda untuk mulai mengelola arsip.</p><button className="primary">Tambah Dokumen</button></div></div></>; }
function Stat({label,value,icon:Icon}) { return <div className="stat"><div className="stat-icon"><Icon size={20}/></div><div><span>{label}</span><strong>{value}</strong></div></div> }
function EmptyPage({title}) { return <div className="panel page-empty"><div className="empty"><div className="empty-icon"><FileText size={28}/></div><h2>{title}</h2><p>Modul {title.toLowerCase()} siap dikembangkan dan akan terhubung ke Supabase.</p></div></div> }

export default App;
