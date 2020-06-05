FROM node:14.4.0-alpine

RUN apk add --no-cache bash

COPY . /app
WORKDIR /app

RUN npm install
RUN npm run build
RUN npm prune --production

EXPOSE 3000

CMD npm start
