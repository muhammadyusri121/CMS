# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Salin fail package dan folder prisma
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (termasuk Prisma)
RUN npm install

# Salin semua kod sumber
COPY . .


# RUN npx prisma generate

# Build aplikasi
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Salin fail yang diperlukan sahaja dari stage builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next 2>/dev/null || true
COPY --from=builder /app/dist ./dist 2>/dev/null || true
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./ 2>/dev/null || true

EXPOSE 3000

# Start aplikasi (sesuaikan dengan script di package.json)
CMD ["npm", "run", "start"]
