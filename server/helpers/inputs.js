/**
 * Created by groupsky on 12.08.16.
 */

module.exports = {
  formatter: {
    integer: formatterInteger,
    date: formatterDate
  },
  validator: {
    positive: validatorPositive,
    greaterOrEqual: validatorGreaterOrEqual,
    date: validatorDate
  }
}

function formatterInteger (param, connection, actionTemplate) {
  var i = parseInt(param)
  if (i != param) return undefined
  return i
}

function formatterDate (param, connection, actionTemplate) {
  var timestamp = formatterInteger(param, connection, actionTemplate)
  if (typeof timestamp !== 'number') return null
  return new Date(timestamp)
}

function validatorPositive (param, connection, actionTemplate) {
  if (param <= 0) {
    return 'must be > 0'
  } else {
    return true
  }
}

function validatorGreaterOrEqual (limit) {
  return function (param, connection, actionTemplate) {
    if (param < limit) {
      return 'must be >= ' + limit
    } else {
      return true
    }
  }
}

function validatorDate (param, connection, actionTemplate) {
  if (param instanceof Date) {
    return true
  }
  return JSON.stringify(param) + ' must be Date'
}
