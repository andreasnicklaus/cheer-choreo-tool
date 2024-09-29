FROM node:22-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i --omit=dev
COPY ./src ./src
CMD [ "npm", "run", "start" ]