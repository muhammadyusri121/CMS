FROM node:24-alpine AS builder

# Set working directory
WORKDIR /app

# Salin config dan dependensi
COPY package*.json ./
COPY prisma ./prisma/

# Install seluruh dependency
RUN npm cache clean --force
RUN npm install

# Salin sisa kode program (Front-end & Server Backend)
COPY . .

# Buat Prisma Client & Build Aplikasi Vite (Front-end SPA)
RUN npx prisma generate
RUN npm run build

# --- TAHAP 2: PROD RUNNER ---
FROM node:24-alpine

WORKDIR /app

# Salin dependencies & folder yang diperlukan dari image builder 
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

# Expose port (Internal Docker)
EXPOSE 3000

# Eksekusi migrasi database otomatis saat jalan, lalu hidupkan server API (TSX)
CMD ["sh", "-c", "npx prisma db push && npx tsx server/index.ts"]
