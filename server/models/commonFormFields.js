'use strict';

module.exports = {
    //Common form fields    
    endDateTime: {
        type: 'timestamp',
        required: true
    },
    startDateTime: {
        type: 'timestamp',
        required: true
    },
    location: {
        type: 'text',
        required: true
    },
    observers: {
        type: 'text',
        required: true
    },
    rain: {
        type: 'choice',
        relation: {
            model: 'nomenclature',
            filter: { type: 'main_rain' }
        }
    },
    temperature: 'num',
    windDirection: {
        type: 'choice',
        relation: {
            model: 'nomenclature',
            filter: { type: 'main_wind_direction' }
        }
    },
    windSpeed: {
        type: 'choice',
        relation: {
            model: 'nomenclature',
            filter: { type: 'main_wind_force' }
        }
    },
    cloudiness: {
        type: 'choice',
        relation: {
            model: 'nomenclature',
            filter: { type: 'main_cloud_level' }
        }
    },
    cloudsType: 'text',
    visibility: '+num',
    mto: 'text',
    notes: 'text',
    threats: {
        type: 'multi',
        relation: {
            model: 'nomenclature',
            filter: { type: 'main_threats' }
        }
    },

    //Internal fields
    user: {
        type: 'choice',
        required: true,
        relation: {
            model: 'user'
        }
    },
    createdAt: {
        type: 'timestamp',
        required: true
    },
    updatedAt: { 
        type: 'timestamp',
        required: true
    },
    imported: 'int'

};

