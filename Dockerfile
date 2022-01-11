FROM node:14-alpine as build-stage

WORKDIR /app

COPY . .

RUN yarn install  --immutable --immutable-cache \
  && yarn build \
  && yarn cache clean \
  && npm pack . | tail -n 1 | xargs tar -xvf

FROM alpine/k8s:1.21.2 as production-stage

RUN apk add nodejs-current yarn mysql-client mariadb-connector-c postgresql-client rsync openssh-client

COPY --from=build-stage /app/package .

RUN NODE_ENV=production yarn install --production --immutable --immutable-cache \
  && yarn cache clean
