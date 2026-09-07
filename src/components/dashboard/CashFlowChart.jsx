import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatCurrency } from '../../lib/utilities/currency';

export default function CashFlowChart({ data }) {
  return (
    <section className="panel">
      <div className="panel-heading"><div><p className="eyebrow">Grafik</p><h3>Arus Kas</h3></div><span className="muted">6 bulan terakhir</span></div>
      <div className="chart-wrap">
        {data.length ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} barGap={8}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="income" name="Pemasukan" radius={[5,5,0,0]} />
              <Bar dataKey="expense" name="Pengeluaran" radius={[5,5,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <div className="empty-state">Belum ada data transaksi untuk ditampilkan.</div>}
      </div>
    </section>
  );
}
