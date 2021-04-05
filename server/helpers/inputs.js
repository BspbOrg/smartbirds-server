/**
 * Created by groupsky on 12.08.16.
 */

module.exports = {
  formatter: {
    integer: formatterInteger,
    date: formatterDate,
    nomenclature: formatterNomenclature,
    float: formatterFloat
  },
  validator: {
    positive: validatorPositive,
    greaterOrEqual: validatorGreaterOrEqual,
    date: validatorDate
  }
}

function formatterInteger (param) {
  const i = parseInt(param)
  if (('' + i) !== ('' + param)) return
  return i
}

function formatterDate (param, actionTemplate) {
  const timestamp = formatterInteger(param)
  if (typeof timestamp !== 'number') return
  return new Date(timestamp)
}

function formatterFloat (param) {
  const f = parseFloat(param)
  if (('' + f) !== ('' + param)) return
  return f
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

/**
 * Transform threat param to string identifier if passed as object.
 * Transformation is done here because field directive currently does not work
 * with string identifiers for nomenclature.
 * TODO: remove when refactor frontend to work with string identifiers instead of objects
 */
function formatterNomenclature (param) {
  try {
    const json = JSON.parse(param)
    if (json.label && json.label.en) {
      return json.label.en
    }
  } catch (err) {}

  return param
}
