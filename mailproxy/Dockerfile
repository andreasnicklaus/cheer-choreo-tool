FROM node:22-alpine
WORKDIR /usr/src/app

ENV NODE_ENV=production

RUN apk --no-cache add curl

COPY package*.json ./
RUN npm i --omit=dev

COPY ./src ./src
CMD [ "npm", "run", "start" ]