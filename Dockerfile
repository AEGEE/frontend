FROM node:10

WORKDIR /usr/app/src

COPY ./ /usr/app/src

CMD npm install && npm run build
