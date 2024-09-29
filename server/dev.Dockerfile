FROM node:22-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
CMD [ "npm", "run", "dev" ]