FROM node:22-alpine
WORKDIR /usr/src/app

RUN apk --no-cache add curl

COPY package*.json ./
RUN npm i
CMD [ "npm", "run", "dev" ]