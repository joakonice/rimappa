FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN apk add --no-cache make gcc g++ python3 && \
    npm install --legacy-peer-deps

FROM node:18-alpine AS builder
WORKDIR /app
RUN apk add --no-cache make gcc g++ python3
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache make gcc g++ python3

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/bcrypt ./node_modules/bcrypt

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"] 