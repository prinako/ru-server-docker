# Build stage
FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY ./ ./

# Final stage
FROM node:20-alpine

RUN apk add -U tzdata

ENV TZ=America/Belem

RUN ln -s /usr/share/zoneinfo/America/Belem /etc/localtime

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/src ./src

CMD [ "node", "src/server.js" ]
