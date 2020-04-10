function identity (i) {
  return i
}

exports.identity = identity

/**
 * Map each entry in provided object and return new object with mapped keys and mapped values
 * @param {object} object
 * @param {function (value: any, key: string, object: object): any} [mapValueFunc?]
 * @param {function (key: string, value: any, object: object): any} [mapKeyFunc?]
 * @returns {object}
 */
exports.mapObject = function mapObject (object, mapValueFunc = identity, mapKeyFunc = identity) {
  return Object.entries(object).reduce((aggregate, [key, value]) => {
    aggregate[mapKeyFunc(key, value, object)] = mapValueFunc(value, key, object)
    return aggregate
  }, {})
}

/**
 * Iterate over all entries of the provided object and call the func
 * @param {object} object
 * @param {function (value: any, key: string, object: object)} func
 */
exports.forEachObject = function forEachObject (object, func) {
  Object.entries(object).forEach(([key, value]) => func(value, key, object))
}
