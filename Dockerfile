FROM node:10

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
EXPOSE 5000

CMD [ "npm", "start" ]
