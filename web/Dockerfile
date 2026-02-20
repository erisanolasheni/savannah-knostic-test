FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# build the app
RUN npm run build

# Use a lightweight server
RUN npm install -g serve

EXPOSE 5173
# map serve port
CMD ["serve", "-s", "dist", "-l", "5173"]
