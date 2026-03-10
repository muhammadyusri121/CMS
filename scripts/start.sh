#!/bin/sh

# Pastikan script berhenti jika ada error
set -e

echo "🔍 Memeriksa koneksi database di $DATABASE_URL ..."

# Mencoba melakukan migrasi
# Jika gagal, kita beri pesan yang lebih jelas
if ! npx prisma migrate deploy; then
  echo "❌ Error: Gagal melakukan migrasi database. Pastikan DATABASE_URL benar dan database dapat dijangkau."
  # Kita tetap izinkan aplikasi jalan jika migrasi gagal (opsional), 
  # tapi biasanya lebih baik stop di sini.
  # exit 1 
fi

echo "🚀 Memulai aplikasi..."
exec node dist-server/index.js
