FROM node:22-alpine
WORKDIR /usr/src/app

ENV TZ=Europe/Amsterdam

RUN apk add --update --no-cache python3 build-base gcc && ln -sf /usr/bin/python3 /usr/bin/python

RUN apk --update add tzdata
RUN cp /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN apk del tzdata

ENV NODE_ENV=production

COPY package*.json ./
RUN npm i --omit=dev

COPY ./src ./src
CMD [ "npm", "run", "start" ]