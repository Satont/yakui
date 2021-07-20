FROM node:16-alpine3.14

RUN apk add --no-cache bash

COPY . /app
WORKDIR /app

RUN yarn
RUN yarn eslint
RUN yarn build
#RUN npm prune --production

EXPOSE 3000
EXPOSE 9229

COPY docker.sh /
RUN chmod +x /docker.sh
ENTRYPOINT ["/docker.sh"]
