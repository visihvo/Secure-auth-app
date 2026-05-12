FROM node:latest

WORKDIR /app
ENV npm_config_build_from_source=sqlite3
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 5000
USER node
CMD ["node", "server.js"]