import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import BalanceCard from '../../components/dashboard/BalanceCard';
import SummaryCards from '../../components/dashboard/SummaryCards';
import CashFlowChart from '../../components/dashboard/CashFlowChart';
import { formatCurrency } from '../../lib/utilities/currency';

const monthLabel = (key) => new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(new Date(`${key}-01T00:00:00`));

export default function HomePage({ user }) {
  const [transactions, setTransactions] = useState([]);
  const [funds, setFunds] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true); setError('');
      const [tx, fund, budget] = await Promise.all([
        supabase.from('transactions').select('id, type, amount, transaction_date, description, category_id, finance_categories(name)').eq('user_id', user.id).order('transaction_date', { ascending: false }),
        supabase.from('finance_funds').select('*').eq('user_id', user.id).eq('is_active', true).order('created_at', { ascending: true }),
        supabase.from('finance_budgets').select('*, finance_categories(name)').eq('user_id', user.id).order('period_end', { ascending: true }),
      ]);
      if (!active) return;
      if (tx.error) setError(tx.error.message); else setTransactions(tx.data || []);
      setFunds(fund.error ? [] : (fund.data || []));
      setBudgets(budget.error ? [] : (budget.data || []));
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, [user.id]);

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);
    return { income, expense, difference: income - expense };
  }, [transactions]);

  const chartData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const rows = transactions.filter(t => String(t.transaction_date || '').slice(0, 7) === key);
      return { label: monthLabel(key), income: rows.filter(t => t.type === 'income').reduce((s,t) => s + Number(t.amount || 0), 0), expense: rows.filter(t => t.type === 'expense').reduce((s,t) => s + Number(t.amount || 0), 0) };
    });
  }, [transactions]);

  return <div className="page-content">
    <header className="page-header"><div><p className="eyebrow">WDOKU</p><h1>Beranda</h1><p className="muted">Ringkasan kondisi keuangan Anda.</p></div></header>
    {error && <div className="alert">Gagal memuat transaksi: {error}</div>}
    <BalanceCard balance={stats.difference} />
    <SummaryCards income={stats.income} expense={stats.expense} difference={stats.difference} />
    <CashFlowChart data={chartData} />
    <div className="two-column">
      <section className="panel"><div className="panel-heading"><div><p className="eyebrow">Keuangan</p><h3>Anggaran</h3></div></div>
        {budgets.length ? <div className="budget-list">{budgets.slice(0, 4).map(b => <div className="budget-item" key={b.id}><div className="row-between"><strong>{b.name}</strong><span>{formatCurrency(b.amount)}</span></div><div className="progress"><span style={{width:'0%'}} /></div><small className="muted">Belum ada perhitungan penggunaan</small></div>)}</div> : <div className="empty-state"><strong>Belum ada anggaran</strong><span>Tambahkan anggaran untuk memantau batas pengeluaran.</span></div>}
      </section>
      <section className="panel"><div className="panel-heading"><div><p className="eyebrow">Keuangan</p><h3>Sumber Dana</h3></div></div>
        {funds.length ? <div className="fund-list">{funds.slice(0, 4).map(f => <div className="fund-item" key={f.id}><div><strong>{f.name}</strong><span className="muted">{f.type || 'Sumber dana'}</span></div><strong>{formatCurrency(f.balance ?? f.initial_balance ?? 0)}</strong></div>)}</div> : <div className="empty-state"><strong>Belum ada sumber dana</strong><span>Tambahkan rekening, dompet, atau kas.</span></div>}
      </section>
    </div>
    <section className="panel"><div className="panel-heading"><div><p className="eyebrow">Aktivitas</p><h3>Transaksi Terbaru</h3></div></div>
      {loading ? <div className="empty-state">Memuat transaksi...</div> : transactions.length === 0 ? <div className="empty-state"><strong>Belum ada transaksi</strong><span>Transaksi Anda akan muncul di sini.</span></div> : <div className="transaction-list">{transactions.slice(0, 5).map(t => <div className="transaction-row" key={t.id}><div><strong>{t.description || t.finance_categories?.name || 'Transaksi'}</strong><span className="muted">{t.transaction_date}</span></div><strong className={t.type === 'income' ? 'income-text' : 'expense-text'}>{t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}</strong></div>)}</div>}
    </section>
  </div>;
}
