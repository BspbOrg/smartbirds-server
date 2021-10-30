FROM node:14

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
EXPOSE 5000

CMD [ "npm", "start" ]
