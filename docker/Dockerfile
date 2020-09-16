FROM node:12.10.0-alpine AS builder

COPY . /usr/app/src
WORKDIR /usr/app/src

RUN npm install --only=production
RUN npm run build

FROM nginx:1.17.0-alpine

COPY --from=builder /usr/app/src /usr/app/src
COPY ./docker/frontend-nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./docker/frontend-nginx/sites/default.conf /etc/nginx/sites-available/default.conf

# it has some default settings there which result in displaying
# the default nginx page, which is not what we need
RUN rm -rf /etc/nginx/conf.d

RUN apk add curl

WORKDIR /usr/app/src/dist
EXPOSE 8083
CMD ["nginx"]
