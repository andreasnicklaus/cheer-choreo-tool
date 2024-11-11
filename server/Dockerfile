FROM node:22
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm i --omit=dev

COPY ./src ./src
CMD [ "npm", "run", "start" ]