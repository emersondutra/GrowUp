# ===================================================
# Dockerfile para Deploy em VPS - GrowUp Investment Tracker
# Multi-stage build otimizado para produção
# ===================================================

FROM node:20-alpine AS builder

WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm install

# Copia código fonte
COPY . .

# Constrói o frontend Vite para /app/dist
RUN npm run build

# Stage 2: Runtime de Produção
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm install --omit=dev && npm install -g tsx

# Copia build do frontend e arquivos do servidor backend
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src ./src
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

EXPOSE 3000

CMD ["tsx", "server.ts"]
