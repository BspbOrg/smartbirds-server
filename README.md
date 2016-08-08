# smartbirds-server

## Dev setup

Initialize the containers
```
npm install
docker-compose up
docker-compose run web npm run seed
```

From this point on only start in enough
```
docker-compose start
```

## Structure
The project contains both frontend angular 1.5 application and backend [actionhero.js](http://www.actionherojs.com/) application.

### Frontend
Code is in [client/scripts](client/scripts) split by types. To build in dev use `npm run budo` - this will run a live-update server.

### Backend
Code is in [server](server). To run server in dev use `npm run ah` - to use the docker db use `docker-compose start db dbadmin`
