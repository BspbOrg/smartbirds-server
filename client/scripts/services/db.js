/**
 * Created by groupsky on 17.03.16.
 */

var angular = require('angular')
require('../app').service('db', /* @ngInject */function ($q, Location, Nomenclature, Species, User, Visit, Zone) {
  var db = {
    locations: {},
    nomenclatures: {},
    species: {},
    users: {},
    zones: {},
    visits: {}
  }

  db.locations.$promise = Location.query({limit: -1}).$promise.then(function (locations) {
    var res = db.locations
    locations.forEach(function (location) {
      res[location.id] = location
    })
    return res
  }).finally(function () {
    delete db.locations.$promise
  });

  (db.$updateNomenclatures = function () {
    db.nomenclatures = {}
    db.nomenclatures.$promise = Nomenclature.query({limit: -1}).$promise.then(function (items) {
      var res = db.nomenclatures
      items.forEach(function (item) {
        res[item.type] = res[item.type] || {}
        res[item.type][item.label.bg] = item
      })
      return res
    }).finally(function () {
      delete db.nomenclatures.$promise
    })
  })();

  (db.$updateSpecies = function () {
    db.species = {}
    db.species.$promise = Species.query({limit: -1}).$promise.then(function (items) {
      var res = db.species
      items.forEach(function (item) {
        res[item.type] = res[item.type] || {}
        res[item.type][item.label.la] = item
      })
      return res
    }).finally(function () {
      delete db.species.$promise
    })
  })()

  db.users.$promise = User.query({limit: -1}).$promise.then(function (users) {
    var res = db.users
    users.forEach(function (user) {
      res[user.id] = user
    })
    return res
  }).catch(function (response) {
    if (response.status === 403) {
      return []
    }
    return $q.reject(response)
  }).finally(function () {
    delete db.users.$promise
  })

  db.zones.$promise = Zone.query({limit: -1, nomenclature: true}).$promise.then(function (zones) {
    var res = db.zones
    zones.forEach(function (zone) {
      res[zone.id] = zone
    })
    return res
  }).finally(function () {
    delete db.zones.$promise
  })

  db.visits.$promise = Visit.query({limit: -1, nomenclature: true}).$promise.then(function (visits) {
    var res = db.visits
    visits.forEach(function (visit) {
      res[visit.year] = visit
    })
    return res
  }).finally(function () {
    delete db.visits.$promise
  })

  var promises = []
  angular.forEach(db, function (table) {
    table.$promise && promises.push(table.$promise)
  })
  db.$promise = $q.all(promises).then(function () {
    return db
  }).finally(function () {
    delete db.$promise
  })

  return db
})
