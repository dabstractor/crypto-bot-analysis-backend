FROM node:9.6.1

RUN mkdir -p /usr/src/app
COPY ./package.json /usr/src/app/package.json

WORKDIR /usr/src/app

RUN npm install

EXPOSE 3000

CMD [ "npm", "start" ]
