import { Wallet } from 'lucide-react';
import { formatCurrency } from '../../lib/utilities/currency';

export default function BalanceCard({ balance }) {
  return (
    <section className="balance-card">
      <div>
        <p className="eyebrow">Saldo Saat Ini</p>
        <h2>{formatCurrency(balance)}</h2>
        <p className="muted">Total pemasukan dikurangi pengeluaran</p>
      </div>
      <div className="balance-icon"><Wallet size={24} /></div>
    </section>
  );
}
