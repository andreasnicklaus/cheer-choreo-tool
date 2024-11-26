FROM node:22-alpine
WORKDIR /usr/src/app

ENV Europe/Amsterdam

RUN apk --update add tzdata
RUN cp /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN apk del tzdata

RUN apk --no-cache add curl

COPY package*.json ./
RUN npm i
CMD [ "npm", "run", "dev" ]