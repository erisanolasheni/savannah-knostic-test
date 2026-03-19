FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine

WORKDIR /app

RUN addgroup -g 1001 -S app && adduser -u 1001 -S app -G app

COPY --from=builder /app/dist ./dist

USER app

EXPOSE 5173

CMD ["npx", "-y", "serve", "-s", "dist", "-l", "5173"]
