var _ = require('lodash');
var Promise = require('bluebird');

_.forOwn({
  nomenclature: {
    keys: {
      bg: 'labelBg',
      en: 'labelEn'
    }
  },
  species: {
    keys: 'labelLa'
  }
}, function (definition, model) {

  exports[model + 'TypeList'] = {
    name: model + ':typeList',
    description: model + ':typeList',
    //middleware: ['auth'],

    inputs: {
      type: {required: true}
    },

    run: function (api, data, next) {
      return Promise.resolve(data.params)
        .then(function (params) {
          var q = {
            "where": {type: data.params.type}
          };

          return q;
        })
        .then(function (q) {
          return api.models[model].findAndCountAll(q);
        })
        .then(function (result) {
          return Promise.map(result.rows, function (nomenclature) {
              return nomenclature.apiData(api);
            })
            .then(function (rows) {
              return {
                count: result.count,
                rows: rows
              };
            });
        })
        .then(function (result) {
          data.response.count = result.count;
          data.response.data = result.rows;
          return data;
        })
        .then(function () {
          return next();
        }, function (e) {
          console.error('Failure to list ' + model, e);
          return next(e);
        });
    }
  };

  (function (define) {
    _.isObject(definition.keys) ? _.forOwn(definition.keys, define) : define(definition.keys);
  })(function (key, label) {
    exports[model + (label && _.capitalize(label) || '') + 'View'] = {
      name: model + (label && ':' + label || '') + ':view',
      description: model + (label && ':' + label || '') + ':view',
      middleware: ['auth'],
      inputs: {
        type: {required: true},
        value: {required: true}
      },

      run: function (api, data, next) {
        return Promise.resolve(data.params)
          .then(function (params) {
            var q = {
              where: {
                type: data.params.type
              }
            };
            q.where[key] = data.params.value;

            return q;
          })
          .then(function (q) {
            return api.models[model].findOne(q);
          })
          .then(function (nomenclature) {
            if (!nomenclature) {
              data.connection.rawConnection.responseHttpCode = 404;
              return Promise.reject(new Error(model + 'not found'))
            }

            return nomenclature.apiData(api);
          })
          .then(function (nomenclature) {
            data.response.data = nomenclature;

            return data;
          })
          .then(function () {
            return next();
          }, function (e) {
            console.error('Failure to get ' + model + (label ? ' by ' + label : ''), e);
            return next(e);
          });
      }
    };
  });
});
