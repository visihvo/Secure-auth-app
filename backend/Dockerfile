FROM node:20

WORKDIR /app

ENV npm_config_build_from_source=sqlite3

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]