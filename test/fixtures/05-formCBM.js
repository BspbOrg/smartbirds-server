/**
 * Created by dani on 11.01.16.
 */

var lodash = require('lodash');

var baseModel = {
  plotBg: '1',
  plotEn: '1',
  visitBg: 'e-early-visit',
  visitEn: 'e-early-visit',
  secondaryHabitatBg: 'a-1-broadleaved-woodland',
  secondaryHabitatEn: 'a-1-broadleaved-woodland',
  primaryHabitatBg: 'a-2-coniferous-woodland',
  primaryHabitatEn: 'a-2-coniferous-woodland',
  count: 10,
  distanceBg: '3-over-100-m',
  distanceEn: '3-over-100-m',
  species: 'Accipiter nisus',
  notes: 'Some test notes',
  visibility: 5.5,
  mto: 'pretty nice weather',
  cloudinessBg: '33-66',
  cloudinessEn: '33-66',
  cloudsType: 'Light grey clouds',
  windDirectionBg: 'ene',
  windDirectionEn: 'ene',
  windSpeedBg: '2-light-breeze',
  windSpeedEn: '2-light-breeze',
  temperature: 24.3,
  rainBg: 'drizzle',
  rainEn: 'drizzle',
  observers: 'Some test observers',
  endDateTime: '10/12/2015 10:15',
  startDateTime: '09/12/2015 08:10',
  latitude: 42.1463749,
  longitude: 24.7492006
};

module.exports = [
  {
    model: 'formCBM',
    data: lodash.extend({}, baseModel, {
      zone: {id: 'freeZonePlovdiv'},
      user: {email: 'user@smartbirds.com'},
    })
  },
  {
    model: 'formCBM',
    data: lodash.extend({}, baseModel, {
      zone: {id: 'freeZonePlovdiv'},
      user: {email: 'admin@smartbirds.com'},
    })
  },
  {
    model: 'formCBM',
    data: lodash.extend({}, baseModel, {
      zone: {id: 'freeZonePlovdiv'},
      user: {email: 'admin@smartbirds.com'},
    })
  },
  {
    model: 'formCBM',
    data: lodash.extend({}, baseModel, {
      zone: {id: 'freeZoneSofia'},
      user: {email: 'admin@smartbirds.com'},
    })
  },
];
