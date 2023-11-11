# Build stage
FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY ./ ./

# Final stage
FROM node:20-alpine

RUN apk add -U tzdata

ENV TZ=America/Sao_Paulo

RUN cp /usr/share/zoneinfo/America/Santiago /etc/localtime

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/src ./src

CMD [ "node", "src/server.js" ]
