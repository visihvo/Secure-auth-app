FROM node:20-slim

WORKDIR /app
ENV npm_config_build_from_source=sqlite3

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 5000
USER node
CMD ["node", "server.js"]