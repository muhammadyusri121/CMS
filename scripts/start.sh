#!/bin/sh

# Bersihkan quotes jika ada (mencegah error parsing)
CLEANED_URL=$(echo $DATABASE_URL | sed 's/"//g')
export DATABASE_URL=$CLEANED_URL

echo "🔍 Memeriksa koneksi database..."

# Cek JWT_SECRET agar tidak fatal error nanti
if [ -z "$JWT_SECRET" ]; then
  echo "⚠️ PERINGATAN: JWT_SECRET tidak terdeteksi di Environment Variable!"
fi

# Menggunakan db push alih-alih migrate deploy untuk database yang sudah ada isinya (baseline)
# --accept-data-loss digunakan jika ada perubahan schema yang mengharuskan penghapusan data kolom (hati-hati)
if ! npx prisma db push --skip-generate; then
  echo "❌ Error: Gagal menyelaraskan database. Pastikan DATABASE_URL benar."
  # exit 1 
fi

echo "🚀 Memulai aplikasi..."
exec node dist-server/index.js
