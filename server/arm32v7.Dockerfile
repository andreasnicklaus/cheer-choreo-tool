FROM node:24.21.0 AS build
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm i --omit=dev

FROM arm32v7/node:22.23.3-alpine AS server
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/node_modules  ./node_modules
COPY --from=build /usr/src/app/package*.json  ./
COPY ./src ./src
CMD [ "npm", "run", "start" ]