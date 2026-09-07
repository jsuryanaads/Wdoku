# Wdoku

**Wdoku — Pencatatan Keuangan Pribadi**

Aplikasi web untuk mencatat pemasukan, pengeluaran, saldo, dan kategori keuangan pribadi secara sederhana dan aman.

## Teknologi

- React 18
- Vite 6
- Tailwind CSS 3
- Lucide React
- Supabase Auth & PostgreSQL
- GitHub Pages

## Fitur saat ini

- Login dan registrasi pengguna dengan Supabase Auth
- Dashboard saldo, pemasukan, pengeluaran, dan jumlah transaksi
- CRUD dasar transaksi pemasukan/pengeluaran
- Kategori keuangan per pengguna
- Pencarian transaksi
- RLS untuk isolasi data antar pengguna
- Responsive desktop dan mobile

## Environment

Buat file `.env.local` berdasarkan `.env.example` dan isi kredensial Supabase. Jangan commit file `.env` atau `.env.local`.
