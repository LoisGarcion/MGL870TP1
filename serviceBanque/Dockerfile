FROM node:16

WORKDIR /app

COPY . /app

RUN npm install

EXPOSE 8081

CMD node --require ./logs.js index.js