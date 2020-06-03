FROM node:14.4.0-alpine

ENV NODE_ENV production
ENV ENV production

RUN apk add --no-cache bash

COPY . /app
WORKDIR /app


RUN npm in stall
RUN npm prune --production

EXPOSE 3000

CMD npm start
