'use strict'

var _ = require('lodash');
var Promise = require('bluebird');
var moment = require('moment');
var actions = require('../helpers/actions');

var model = require('../models/formHerps');

exports.formHerpsAdd = {
  name: 'formHerps:create',
  description: 'formHerps:create',
  middleware: ['auth'],
  inputs: model.insertInputs,

  run: actions.getInsert('formHerps')
}; 

exports.formHerpsEdit = {
  name: 'formHerps:edit',
  description: 'formHerps:edit',
  outputExample: {},
  middleware: ['auth'],

  inputs: model.editInputs,

  run: actions.getEdit('formHerps')
};

exports.formHerpsView = {
  name: 'formHerps:view',
  description: 'formHerps:view',
  middleware: ['auth'],
  inputs: {id: {required: true}},

  run: actions.getView('formHerps')
};

exports.formHerpsDelete = {
  name: 'formHerps:delete',
  description: 'formHerps:delete',
  middleware: ['admin'],
  inputs: {id: {required: true}},

  run: actions.getDelete('formHerps')
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
      if (data.params.species) {
        q.where = _.extend(q.where || {}, {
          species: data.params.species
        });
      }      
      if (data.params.from_date) {
        q.where = q.where || {};
        q.where.observationDateTime = _.extend(q.where.observationDateTime || {}, {
          $gte: moment(data.params.from_date).toDate()
        });
      }
      if (data.params.to_date) {
        q.where = q.where || {};
        q.where.observationDateTime = _.extend(q.where.observationDateTime || {}, {
          $lte: moment(data.params.to_date).toDate()
        });
      }
      return q;
    })
}

exports.formHerpsList = {
  name: 'formHerps:list',
  description: 'formHerps:list',
  middleware: ['auth'],
  //location&user&year&month&species&limit&offset
  inputs: {
    location: {},
    user: {},
    species: {},
    from_date: {},
    to_date: {},
    limit: {required: false, default: 20},
    offset: {required: false, default: 0}    
  },

  run: actions.getSelect('formHerps', prepareQuery) 
};