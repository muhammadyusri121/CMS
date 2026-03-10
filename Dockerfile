# Sesuai riset, Prisma 6 di Alpine terkadang bermasalah dengan DNS/WASM/Engine Library.
# Kita berpindah ke Debian Slim (Bullseye/Bookworm) untuk stabilitas yang jauh lebih baik, 
# dengan ukuran yang tetap sangat kecil (optimasi runner).

# Stage 1: Build & Prune
FROM node:20-slim AS builder
RUN apt-get update && apt-get install -y openssl python3 build-essential && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .
RUN npm run build
RUN npm prune --omit=dev

# Stage 2: Runner
FROM node:20-slim AS runner

# Install runtime dependency (OpenSSL) yang dibutuhkan Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy node_modules & hasil build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts

RUN chmod +x ./scripts/start.sh

EXPOSE 3000

# Gunakan env var untuk memastikan Prisma menggunakan engine library yang stabil
ENV PRISMA_CLIENT_ENGINE_TYPE="library"

CMD ["./scripts/start.sh"]
