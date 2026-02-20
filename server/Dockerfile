FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

RUN npm run build || true
# actually it's a tsx app, we can just run with tsx, or compile it.
# package.json does not have build script yet, let's just run tsx. 
# Better yet, let's use npx tsx src/index.ts

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push && npx tsx prisma/seed.ts && npx tsx src/index.ts"]
