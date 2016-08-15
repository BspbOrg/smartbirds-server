'use strict'

var _ = require('lodash');
var Promise = require('bluebird');
var moment = require('moment');
var actions = require('../helpers/actions');

var model = require('../models/formBirds');

exports.formBirdsAdd = {
  name: 'formBirds:create',
  description: 'formBirds:create',
  middleware: ['auth'],
  inputs: model.insertInputs,

  run: actions.getInsert('formBirds')
}; 

exports.formBirdsEdit = {
  name: 'formBirds:edit',
  description: 'formBirds:edit',
  outputExample: {},
  middleware: ['auth'],

  inputs: model.editInputs,

  run: actions.getEdit('formBirds')
};

exports.formBirdsView = {
  name: 'formBirds:view',
  description: 'formBirds:view',
  middleware: ['auth'],
  inputs: {id: {required: true}},

  run: actions.getView('formBirds')
};

exports.formBirdsDelete = {
  name: 'formBirds:delete',
  description: 'formBirds:delete',
  middleware: ['admin'],
  inputs: {id: {required: true}},

  run: actions.getDelete('formBirds')
};



function prepareQuery(api, data) {
  return Promise.resolve({})
    .then(function (q) {
      var limit = parseInt(data.params.limit) || 20;
      // if (!data.session.user.isAdmin) {
      //   limit = Math.max(1, Math.min(1000, limit));
      // }
      var offset = data.params.offset || 0;

      q = {
        order: [
          ['updatedAt', 'DESC'],
          ['id', 'DESC']
        ],
        offset: offset
      };
      if (limit !== -1)
        q.limit = limit;

      if (!data.session.user.isAdmin) {
        q.where = _.extend(q.where || {}, {
          userId: data.session.userId
        });
      } else {
        if (data.params.user) {
          q.where = _.extend(q.where || {}, {
            userId: data.params.user
          });
        }
      }
      if (data.params.location) {
        q.where = _.extend(q.where || {}, {
          location: data.params.location
        });
      }
      if (data.params.year) {
        q.where = _.extend(q.where || {}, {
          startDateTime: {
            $gte: moment().year(data.params.year).startOf('year').toDate(),
            $lte: moment().year(data.params.year).endOf('year').toDate()
          }
        });
      }
      if (data.params.month) {
        q.where = _.extend(q.where || {}, {
          startDateTime: {
            $gte: moment().month(data.params.month).startOf('month').toDate(),
            $lte: moment().month(data.params.month).endOf('month').toDate()
          }
        });
      }
      if (data.params.species) {
        q.where = _.extend(q.where || {}, {
          species: data.params.species
        });
      }      
      if (data.params.from_date) {
        q.where = _.extend(q.where || {}, {
          startDateTime: {            
            $gte: moment(data.params.from_date).toDate()
          }
        });
      }
      if (data.params.to_date) {
        q.where = _.extend(q.where || {}, {
          startDateTime: {
            $lte: moment(data.params.to_date).toDate()
          }
        });
      }
      return q;
    })
}

exports.formBirdsList = {
  name: 'formBirds:list',
  description: 'formBirds:list',
  middleware: ['auth'],
  //location&user&year&month&species&limit&offset
  inputs: {
    location: {},
    user: {},        
    year: {},
    month: {}, //TODO
    species: {},
    from_date: {},
    to_date: {},
    limit: {required: false, default: 20},
    offset: {required: false, default: 0}    
  },

  run: actions.getSelect('formBirds', prepareQuery) 
};