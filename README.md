# smartbirds-server
[![Build Status](https://travis-ci.org/BspbOrg/smartbirds-server.svg?branch=master)](https://travis-ci.org/BspbOrg/smartbirds-server)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)


## How to help

You can [help translate](https://poeditor.com/join/project/9RT5wSkZCP) the project.

## Dev setup

Initialize the containers
```
npm install
npm run build
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

# License

[AGPL-v3.0](LICENSE)

Copyright (c) 2015-2018 [Bulgarian Society for the Protection of Birds](http://bspb.org)
