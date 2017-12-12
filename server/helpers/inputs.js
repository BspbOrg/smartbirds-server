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

function formatterInteger (param) {
  var i = parseInt(param)
  if (('' + i) !== ('' + param)) return
  return i
}

function formatterDate (param, actionTemplate) {
  var timestamp = formatterInteger(param)
  if (typeof timestamp !== 'number') return
  return new Date(timestamp)
}

function validatorPositive (param) {
  if (param <= 0) {
    return 'must be > 0'
  } else {
    return true
  }
}

function validatorGreaterOrEqual (limit) {
  return function (param) {
    if (param < limit) {
      return 'must be >= ' + limit
    } else {
      return true
    }
  }
}

function validatorDate (param) {
  if (param instanceof Date) {
    return true
  }
  return JSON.stringify(param) + ' must be Date'
}
