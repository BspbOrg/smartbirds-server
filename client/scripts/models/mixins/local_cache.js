var localforage = require('localforage')

var ID_GENERATOR_NAME = 'idGenerator'
var INITIAL_ID_GENERATOR = 0
var ID_PREFIX = 'local-'

function generateId (data) {
  if (generateId.$storage == null) {
    generateId.$storage = localforage.createInstance({
      driver: localforage.LOCALSTORAGE,
      name: ID_GENERATOR_NAME
    })
  }
  return generateId.$storage
    .getItem(ID_GENERATOR_NAME)
    .then(function (lastId) {
      if (lastId == null) {
        lastId = INITIAL_ID_GENERATOR
      }

      return generateId.$storage.setItem(ID_GENERATOR_NAME, lastId + 1)
    })
    .then(function (newId) {
      data.id = newId
      return data
    })
}

function localSave () {
  var data = this
  var storage = this.constructor.$localStorage
  var p = storage
    .ready()
    .then(function () { return data })
  if (this.id == null) {
    p = p.then(generateId)
  }
  return p
    .then(function (data) {
      return storage.setItem(ID_PREFIX + data.id, data)
        .then(function () { return data })
    })
    .then(function (data) {
      data.$local = true
      return data
    })
}

function localGet (key) {
  var Resource = this
  var storage = Resource.$localStorage
  if (key && key.id) {
    return storage
      .getItem(ID_PREFIX + key.id)
      .then(function (data) {
        if (data == null) return
        var value = new Resource(data)
        value.$local = true
        return value
      })
  }
}

function localList () {
  var Resource = this
  var storage = Resource.$localStorage
  return storage.keys()
    .then(function (keys) {
      return Promise.all(keys
        .filter(function (key) {
          return key.substr(0, ID_PREFIX.length) === ID_PREFIX
        })
        .map(function (key) {
          return Resource.localGet({ id: key.substr(ID_PREFIX.length) })
        })
      )
    })
}

function localDelete (id) {
  var Resource = this
  var storage = Resource.$localStorage

  return storage.removeItem(ID_PREFIX + id)
}

module.exports = {
  inject: function (target, opts) {
    target.$localStorage = localforage.createInstance({
      name: opts.name
    })
    target.prototype.$localSave = localSave
    target.localGet = localGet
    target.localList = localList
    target.localDelete = localDelete
  }
}
