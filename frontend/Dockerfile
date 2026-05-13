FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


FROM nginx:1.30.0-alpine

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

RUN chmod -R 555 /usr/share/nginx/html
RUN mkdir -p /var/cache/nginx \
    && mkdir -p /var/run \
    && mkdir -p /run \
    && touch /run/nginx.pid \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/run \
    && chown -R nginx:nginx /run \
    && chown nginx:nginx /run/nginx.pid

USER nginx

CMD ["nginx", "-g", "daemon off;"]