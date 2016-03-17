/**
 * Created by groupsky on 17.03.16.
 */

require('../app').service('db', /*@ngInject*/function (Location, Nomenclature, Species, User, Zone) {
  var db = {
    locations: {},
    nomenclatures: {},
    species: {},
    users: {},
    zones: {}
  };

  db.locations.$promise = Location.query({limit: -1}).$promise.then(function (locations) {
    var res = db.locations;
    locations.forEach(function (location) {
      res[location.id] = location;
    });
    delete res.$promise;
    return res;
  });


  db.nomenclatures.$promise = Nomenclature.query({limit: -1}).$promise.then(function (items) {
    var res = db.nomenclatures;
    items.forEach(function (item) {
      res[item.type] = res[item.type] || {};
      res[item.type][item.label.bg] = item;
    });
    delete res.$promise;
    return res;
  });

  db.species.$promise = Species.query({limit: -1}).$promise.then(function (items) {
    var res = db.species;
    items.forEach(function (item) {
      res[item.type] = res[item.type] || {};
      res[item.type][item.label.la] = item;
    });
    delete res.$promise;
    return res;
  });

  db.users.$promise = User.query({limit: -1}).$promise.then(function (users) {
    var res = db.users;
    users.forEach(function (user) {
      res[user.id] = user;
    });
    delete res.$promise;
    return res;
  });

  db.zones.$promise = Zone.query({limit: -1}).$promise.then(function (zones) {
    var res = db.zones;
    zones.forEach(function (zone) {
      res[zone.id] = zone;
    });
    delete res.$promise;
    return res;
  });

  return db;
});
