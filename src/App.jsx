import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownCircle, ArrowUpCircle, BarChart3, ChevronRight, CircleDollarSign,
  Folder, LayoutDashboard, LogOut, Menu, Plus, Search, Settings, Trash2,
  UserRound, Wallet, X
} from 'lucide-react';
import { supabase } from './lib/supabase';

const menu = [
  ['Dashboard', LayoutDashboard],
  ['Transaksi', CircleDollarSign],
  ['Kategori', Folder],
  ['Profil', UserRound],
  ['Pengaturan', Settings],
];

const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
const today = () => new Date().toISOString().slice(0, 10);

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState('Dashboard');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) console.error(error);
      setSession(data?.session ?? null);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      if (mounted) setSession(next);
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  if (loading) return <div className="auth-loading">Memuat Wdoku...</div>;
  if (!session) return <Auth />;

  const email = session.user.email || 'Pengguna';
  const initials = (email.slice(0, 2) || 'WD').toUpperCase();
  const logout = async () => { await supabase.auth.signOut(); };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Wallet size={21} /></div>
          <div><strong>Wdoku</strong><span>Keuangan Pribadi</span></div>
          <button className="icon-btn mobile-only" onClick={() => setOpen(false)}><X size={20}/></button>
        </div>
        <nav aria-label="Navigasi utama">
          {menu.map(([label, Icon]) => (
            <button key={label} className={active === label ? 'nav-item active' : 'nav-item'} onClick={() => { setActive(label); setOpen(false); }}>
              <Icon size={19}/><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="user-mini"><div className="avatar">{initials}</div><div><strong>{email}</strong><span>Akun saya</span></div></div>
          <button className="logout" onClick={logout}><LogOut size={17}/> Keluar</button>
        </div>
      </aside>
      {open && <div className="overlay" onClick={() => setOpen(false)} />}
      <main className="main">
        <header className="topbar">
          <button className="icon-btn mobile-menu" onClick={() => setOpen(true)}><Menu size={22}/></button>
          <div><h1>{active}</h1><p>Catat dan pantau keuangan pribadi Anda.</p></div>
          <div className="top-actions"><div className="avatar">{initials}</div></div>
        </header>
        <section className="content">
          {active === 'Dashboard' && <Dashboard userId={session.user.id} onNavigate={setActive} />}
          {active === 'Transaksi' && <Transactions userId={session.user.id} />}
          {active === 'Kategori' && <Categories userId={session.user.id} />}
          {active === 'Profil' && <Profile user={session.user} />}
          {active === 'Pengaturan' && <SettingsPage />}
        </section>
      </main>
    </div>
  );
}

function Auth() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState(''); const [error, setError] = useState(false);
  async function submit(e) {
    e.preventDefault(); if (busy) return; setBusy(true); setMessage(''); setError(false);
    try {
      const result = mode === 'login'
        ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
        : await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim() } } });
      if (result.error) throw result.error;
      if (mode === 'register' && !result.data?.session) setMessage('Registrasi berhasil. Periksa email untuk konfirmasi akun.');
    } catch (err) { setError(true); setMessage(err?.message || 'Terjadi kesalahan.'); }
    finally { setBusy(false); }
  }
  return <div className="auth-page"><div className="auth-card">
    <div className="brand auth-brand"><div className="brand-mark"><Wallet size={22}/></div><div><strong>Wdoku</strong><span>Keuangan Pribadi</span></div></div>
    <h1>{mode === 'login' ? 'Masuk ke Wdoku' : 'Buat akun Wdoku'}</h1>
    <p className="auth-subtitle">Catat pemasukan, pengeluaran, dan lihat kondisi keuangan Anda dalam satu tempat.</p>
    <form onSubmit={submit} noValidate>
      {mode === 'register' && <label>Nama lengkap<input value={name} onChange={e => setName(e.target.value)} placeholder="Nama Anda" autoComplete="name" required /></label>}
      <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@email.com" autoComplete="email" required /></label>
      <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimal 6 karakter" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={6} required /></label>
      {message && <div className={`auth-message ${error ? 'error' : ''}`}>{message}</div>}
      <button className="primary auth-submit" disabled={busy}>{busy ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar'}</button>
    </form>
    <button className="auth-switch" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMessage(''); }}>{mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}</button>
  </div></div>;
}

function useFinanceData(userId) {
  const [transactions, setTransactions] = useState([]); const [categories, setCategories] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = async () => {
    setLoading(true); setError('');
    const [{ data: tx, error: txErr }, { data: cat, error: catErr }] = await Promise.all([
      supabase.from('transactions').select('*, finance_categories(name)').eq('user_id', userId).order('transaction_date', { ascending: false }).order('created_at', { ascending: false }),
      supabase.from('finance_categories').select('*').eq('user_id', userId).order('name')
    ]);
    if (txErr || catErr) setError((txErr || catErr).message);
    setTransactions(tx || []); setCategories(cat || []); setLoading(false);
  };
  useEffect(() => { load(); }, [userId]);
  return { transactions, categories, loading, error, reload: load };
}

function Dashboard({ userId, onNavigate }) {
  const { transactions, loading, error } = useFinanceData(userId);
  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((s,t) => s + Number(t.amount), 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((s,t) => s + Number(t.amount), 0);
    return { income, expense, balance: income - expense, count: transactions.length };
  }, [transactions]);
  const recent = transactions.slice(0, 6);
  return <>
    <div className="welcome finance-welcome"><div><span className="eyebrow">WDOKU v1.0</span><h2>Kelola Keuangan Pribadi</h2><p>Pantau pemasukan, pengeluaran, dan saldo Anda dengan lebih mudah.</p></div><button className="primary" onClick={() => onNavigate('Transaksi')}><Plus size={18}/> Tambah Transaksi</button></div>
    {error && <div className="alert error">Gagal memuat data: {error}</div>}
    <div className="stats">
      <Stat label="Saldo" value={loading ? '...' : rupiah.format(stats.balance)} icon={Wallet} />
      <Stat label="Pemasukan" value={loading ? '...' : rupiah.format(stats.income)} icon={ArrowUpCircle} />
      <Stat label="Pengeluaran" value={loading ? '...' : rupiah.format(stats.expense)} icon={ArrowDownCircle} />
      <Stat label="Transaksi" value={loading ? '...' : String(stats.count)} icon={BarChart3} />
    </div>
    <div className="panel"><div className="panel-head"><div><h3>Transaksi Terbaru</h3><p>Aktivitas keuangan terakhir Anda.</p></div><button className="ghost" onClick={() => onNavigate('Transaksi')}>Lihat semua <ChevronRight size={14}/></button></div>
      {recent.length ? <TransactionTable rows={recent} compact /> : <EmptyState onAdd={() => onNavigate('Transaksi')} />}
    </div>
  </>;
}

function Stat({ label, value, icon: Icon }) { return <div className="stat"><div className="stat-icon"><Icon size={20}/></div><div><span>{label}</span><strong>{value}</strong></div></div>; }

function Transactions({ userId }) {
  const { transactions, categories, loading, error, reload } = useFinanceData(userId); const [show, setShow] = useState(false); const [query, setQuery] = useState('');
  const filtered = transactions.filter(t => `${t.description || ''} ${t.finance_categories?.name || ''}`.toLowerCase().includes(query.toLowerCase()));
  return <>
    <div className="page-head"><div><h2>Transaksi</h2><p>Semua pemasukan dan pengeluaran Anda.</p></div><button className="primary dark" onClick={() => setShow(true)}><Plus size={18}/> Tambah Transaksi</button></div>
    <div className="toolbar"><div className="search"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari transaksi..." /></div></div>
    {error && <div className="alert error">{error}</div>}
    <div className="panel">{loading ? <div className="loading-box">Memuat transaksi...</div> : filtered.length ? <TransactionTable rows={filtered} onDeleted={reload} /> : <EmptyState onAdd={() => setShow(true)} />}</div>
    {show && <TransactionModal userId={userId} categories={categories} onClose={() => setShow(false)} onSaved={() => { setShow(false); reload(); }} />}
  </>;
}

function TransactionTable({ rows, onDeleted }) {
  const remove = async (id) => { if (!confirm('Hapus transaksi ini?')) return; const { error } = await supabase.from('transactions').delete().eq('id', id); if (error) alert(error.message); else onDeleted?.(); };
  return <div className="table-wrap"><table><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th>Tipe</th><th className="amount">Jumlah</th><th></th></tr></thead><tbody>{rows.map(t => <tr key={t.id}><td>{new Date(`${t.transaction_date}T00:00:00`).toLocaleDateString('id-ID')}</td><td><strong>{t.description || 'Tanpa keterangan'}</strong></td><td>{t.finance_categories?.name || 'Tanpa kategori'}</td><td><span className={`type-pill ${t.type}`}>{t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</span></td><td className={`amount ${t.type}`}>{t.type === 'income' ? '+' : '-'} {rupiah.format(Number(t.amount))}</td><td><button className="delete-btn" onClick={() => remove(t.id)} title="Hapus"><Trash2 size={16}/></button></td></tr>)}</tbody></table></div>;
}

function TransactionModal({ userId, categories, onClose, onSaved }) {
  const [type, setType] = useState('expense'); const [amount, setAmount] = useState(''); const [date, setDate] = useState(today()); const [description, setDescription] = useState(''); const [categoryId, setCategoryId] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const submit = async e => { e.preventDefault(); setBusy(true); setError(''); const { error: err } = await supabase.from('transactions').insert({ user_id: userId, type, amount: Number(amount), transaction_date: date, description: description.trim() || null, category_id: categoryId || null }); if (err) { setError(err.message); setBusy(false); } else onSaved(); };
  return <div className="modal-backdrop"><div className="modal"><div className="modal-head"><div><h3>Tambah Transaksi</h3><p>Catat aktivitas keuangan baru.</p></div><button className="icon-btn" onClick={onClose}><X size={20}/></button></div><form onSubmit={submit} className="modal-form">
    <div className="segmented"><button type="button" className={type === 'expense' ? 'selected expense' : ''} onClick={() => setType('expense')}>Pengeluaran</button><button type="button" className={type === 'income' ? 'selected income' : ''} onClick={() => setType('income')}>Pemasukan</button></div>
    <label>Jumlah<input type="number" min="1" step="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" required /></label>
    <label>Tanggal<input type="date" value={date} onChange={e => setDate(e.target.value)} required /></label>
    <label>Kategori<select value={categoryId} onChange={e => setCategoryId(e.target.value)}><option value="">Tanpa kategori</option>{categories.filter(c => c.type === 'both' || c.type === type).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
    <label>Keterangan<input value={description} onChange={e => setDescription(e.target.value)} placeholder="Contoh: Belanja kebutuhan rumah" /></label>
    {error && <div className="alert error">{error}</div>}<div className="modal-actions"><button type="button" className="ghost-btn" onClick={onClose}>Batal</button><button className="primary dark" disabled={busy}>{busy ? 'Menyimpan...' : 'Simpan Transaksi'}</button></div>
  </form></div></div>;
}

function Categories({ userId }) {
  const { categories, loading, error, reload } = useFinanceData(userId); const [name, setName] = useState(''); const [type, setType] = useState('both');
  const add = async e => { e.preventDefault(); if (!name.trim()) return; const { error: err } = await supabase.from('finance_categories').insert({ user_id: userId, name: name.trim(), type }); if (err) alert(err.message); else { setName(''); reload(); } };
  const remove = async id => { if (!confirm('Hapus kategori? Transaksi terkait akan tetap tersimpan.')) return; const { error: err } = await supabase.from('finance_categories').delete().eq('id', id); if (err) alert(err.message); else reload(); };
  return <><div className="page-head"><div><h2>Kategori</h2><p>Atur kategori pemasukan dan pengeluaran.</p></div></div><div className="category-layout"><div className="panel"><div className="panel-head"><div><h3>Tambah Kategori</h3><p>Buat kategori sesuai kebutuhan Anda.</p></div></div><form className="category-form" onSubmit={add}><label>Nama kategori<input value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Investasi" /></label><label>Jenis<select value={type} onChange={e => setType(e.target.value)}><option value="both">Keduanya</option><option value="income">Pemasukan</option><option value="expense">Pengeluaran</option></select></label><button className="primary dark"><Plus size={17}/> Tambah</button></form></div><div className="panel"><div className="panel-head"><div><h3>Daftar Kategori</h3><p>{categories.length} kategori</p></div></div>{loading ? <div className="loading-box">Memuat...</div> : <div className="category-list">{categories.map(c => <div className="category-row" key={c.id}><div className="category-dot"><Folder size={17}/></div><div><strong>{c.name}</strong><span>{c.type === 'both' ? 'Pemasukan & Pengeluaran' : c.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</span></div><button className="delete-btn" onClick={() => remove(c.id)}><Trash2 size={16}/></button></div>)}</div>}{error && <div className="alert error">{error}</div>}</div></div></>;
}

function EmptyState({ onAdd }) { return <div className="empty"><div className="empty-icon"><CircleDollarSign size={28}/></div><h3>Belum ada transaksi</h3><p>Tambahkan transaksi pertama untuk mulai mencatat keuangan pribadi.</p><button className="primary dark" onClick={onAdd}><Plus size={17}/> Tambah Transaksi</button></div>; }
function Profile({ user }) { return <div className="panel profile-panel"><div className="profile-avatar">{(user.email || 'WD').slice(0,2).toUpperCase()}</div><h2>Profil</h2><p className="muted">Akun Wdoku Anda</p><div className="profile-info"><span>Email</span><strong>{user.email}</strong></div><div className="profile-info"><span>ID Pengguna</span><strong>{user.id}</strong></div></div>; }
function SettingsPage() { return <div className="panel page-empty"><div className="empty"><div className="empty-icon"><Settings size={28}/></div><h2>Pengaturan</h2><p>Pengaturan aplikasi akan dikembangkan setelah modul keuangan inti selesai.</p></div></div>; }

export default App;
