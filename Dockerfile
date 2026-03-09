# Stage 1: Install dependencies & Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files dan folder prisma
COPY package*.json ./
COPY prisma ./prisma/

# Install semua library (termasuk Prisma)
RUN npm install

# Copy semua source code aplikasi
COPY . .

# HANYA generate client (agar kode Next.js kenal database)
# Perintah ini tidak melakukan migrasi/perubahan pada isi database
RUN npx prisma generate

# Build aplikasi Next.js
RUN npm run build

# Stage 2: Run aplikasi
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy file yang dibutuhkan saja dari stage builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./
# Jika pakai next.config.js (bukan .mjs), sesuaikan baris di atas ^

EXPOSE 3001

CMD ["npm", "run", "start"]
