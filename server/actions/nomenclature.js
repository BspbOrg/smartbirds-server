var _ = require('lodash');

exports.nomenclatureTypeList = {
  name: 'nomenclature:typeList',
  description: 'nomenclature:typeList',
  middleware: ['auth'],

  inputs: {
    type: {required: true}
  },

  run: function (api, data, next) {
  	var q = {
  		"where": {type: data.params.type}
  	};

    try {
      return api.models.nomenclature.findAndCountAll(q).then(function (result) {
        data.response.count = result.count;
        data.response.data = result.rows.map(function (nomenclature) {
          return nomenclature.apiData(api);
        });
        return next();
      }).catch(function (e) {
        console.error('Failure to list nomenclatures by type', e);
        return next(e);
      });
    } catch (e) {
      console.error(e);
      return next(e);
    }
  }
};

exports.nomenclatureView = {
  name: 'nomenclature:view',
  description: 'nomenclature:view',
  middleware: ['auth'],
  inputs: {
    type: {required: true},
    slug: {required: true}
  },

  run: function (api, data, next) {
    var q = {
      "where": {
        "type": data.params.type,
        "slug": data.params.slug
      }
    };

    try {
      return api.models.nomenclature.findAndCountAll(q).then(function (result) {
        data.response.count = result.count;
        data.response.data = result.rows.map(function (nomenclature) {
          return nomenclature.apiData(api);
        });
        return next();
      }).catch(function (e) {
        console.error('Failure to list nomenclatures by type', e);
        return next(e);
      });
    } catch (e) {
      console.error(e);
      return next(e);
    }
  }
};