# Build stage
FROM node:20-alpine as builder

WORKDIR /app/frontend

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

# Serve stage
FROM node:20-alpine

RUN npm install -g serve

WORKDIR /app/frontend

COPY --from=builder /app/frontend/dist ./dist

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["serve", "-s", "dist", "-l", "3000"]
