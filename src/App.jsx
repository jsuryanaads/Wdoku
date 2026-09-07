import { useState } from 'react';
import { Archive, FileText, Folder, LayoutDashboard, LogIn, Menu, Search, Settings, UserRound, X } from 'lucide-react';

const menu = [
  ['Dashboard', LayoutDashboard],
  ['Dokumen', FileText],
  ['Kategori', Folder],
  ['Profil', UserRound],
  ['Pengaturan', Settings],
];

function App() {
  const [active, setActive] = useState('Dashboard');
  const [open, setOpen] = useState(false);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand"><div className="brand-mark"><Archive size={21} /></div><div><strong>Wdoku</strong><span>Document Manager</span></div><button className="icon-btn mobile-only" onClick={() => setOpen(false)}><X size={20}/></button></div>
        <nav>{menu.map(([label, Icon]) => <button key={label} className={active === label ? 'nav-item active' : 'nav-item'} onClick={() => {setActive(label); setOpen(false)}}><Icon size={19}/><span>{label}</span></button>)}</nav>
        <div className="sidebar-bottom"><div className="user-mini"><div className="avatar">JS</div><div><strong>Pengguna</strong><span>Akun saya</span></div></div><button className="logout"><LogIn size={17}/> Keluar</button></div>
      </aside>
      {open && <div className="overlay" onClick={() => setOpen(false)} />}
      <main className="main">
        <header className="topbar"><button className="icon-btn mobile-menu" onClick={() => setOpen(true)}><Menu size={22}/></button><div><h1>{active}</h1><p>Kelola dokumen Anda dengan rapi dan aman.</p></div><div className="top-actions"><div className="search"><Search size={18}/><input placeholder="Cari dokumen..." /></div><div className="avatar">JS</div></div></header>
        <section className="content">
          {active === 'Dashboard' ? <Dashboard /> : <EmptyPage title={active} />}
        </section>
      </main>
    </div>
  );
}

function Dashboard() {
  return <>
    <div className="welcome"><div><span className="eyebrow">WDOKU v1.0</span><h2>Selamat datang di Wdoku</h2><p>Semua dokumen pribadi Anda, tersimpan dalam satu tempat.</p></div><button className="primary"><FileText size={18}/> Tambah Dokumen</button></div>
    <div className="stats"><Stat label="Total Dokumen" value="0" icon={FileText}/><Stat label="Aktif" value="0" icon={Archive}/><Stat label="Draft" value="0" icon={Folder}/><Stat label="Arsip" value="0" icon={Archive}/></div>
    <div className="panel"><div className="panel-head"><div><h3>Dokumen Terbaru</h3><p>Dokumen yang baru Anda tambahkan.</p></div><button className="ghost">Lihat semua</button></div><div className="empty"><div className="empty-icon"><FileText size={28}/></div><h3>Belum ada dokumen</h3><p>Tambahkan dokumen pertama Anda untuk mulai mengelola arsip.</p><button className="primary">Tambah Dokumen</button></div></div>
  </>;
}
function Stat({label,value,icon:Icon}) { return <div className="stat"><div className="stat-icon"><Icon size={20}/></div><div><span>{label}</span><strong>{value}</strong></div></div> }
function EmptyPage({title}) { return <div className="panel page-empty"><div className="empty"><div className="empty-icon"><FileText size={28}/></div><h2>{title}</h2><p>Modul {title.toLowerCase()} siap dikembangkan dan akan terhubung ke Supabase.</p></div></div> }

export default App;
