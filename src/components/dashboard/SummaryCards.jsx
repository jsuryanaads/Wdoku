import { ArrowDownLeft, ArrowUpRight, Scale } from 'lucide-react';
import { formatCurrency } from '../../lib/utilities/currency';

export default function SummaryCards({ income, expense, difference }) {
  const items = [
    { label: 'Pemasukan', value: income, icon: ArrowDownLeft, tone: 'positive' },
    { label: 'Pengeluaran', value: expense, icon: ArrowUpRight, tone: 'negative' },
    { label: 'Selisih', value: difference, icon: Scale, tone: difference >= 0 ? 'positive' : 'negative' },
  ];

  return (
    <div className="summary-grid">
      {items.map(({ label, value, icon: Icon, tone }) => (
        <article className="summary-card" key={label}>
          <div className={`summary-icon ${tone}`}><Icon size={19} /></div>
          <div><p className="muted">{label}</p><strong>{formatCurrency(value)}</strong></div>
        </article>
      ))}
    </div>
  );
}
