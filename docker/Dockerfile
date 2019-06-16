FROM node:10 AS builder

WORKDIR /usr/app/src

COPY . /usr/app/src

RUN npm install && npm run build

FROM nginx:1.15-alpine as prod

RUN adduser -D -H -u 1000 -s /bin/bash www-data && rm /etc/nginx/conf.d/default.conf
RUN mkdir -p /usr/app/src/dist

WORKDIR /usr/app/src/dist

COPY ./docker/oms-frontend-nginx/nginx.conf /etc/nginx/
COPY ./docker/oms-frontend-nginx/sites/*.conf /etc/nginx/sites-available/
COPY --from=builder /usr/app/src /usr/app/src

RUN chown -R www-data:www-data /usr/app/

#USER www-data #TODO

EXPOSE 8083
