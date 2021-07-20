FROM node:16-buster-slim

RUN apt-get update && apt install bash openssl

COPY . /app
WORKDIR /app

RUN yarn
RUN yarn prisma generate
RUN yarn eslint
RUN yarn build
#RUN npm prune --production

EXPOSE 3000
EXPOSE 9229

COPY docker.sh /
RUN chmod +x /docker.sh
ENTRYPOINT ["/docker.sh"]
