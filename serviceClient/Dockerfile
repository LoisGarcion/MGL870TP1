FROM node:16

WORKDIR /app

COPY . /app

RUN npm install

EXPOSE 8080

CMD node --require ./logs.js --require ./metrics.js index.js