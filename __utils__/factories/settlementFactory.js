const localFieldFactory = require('./localFieldFactory')
let sequence = 0

async function settlementFactory (api, propOverrides, {
  create = true
} = {}) {
  sequence++
  const record = {
    longitude: (sequence % 3600) / 10 - 180,
    latitude: sequence / 36000,
    ...localFieldFactory('name'),
    ...propOverrides
  }

  if (create) {
    return api.models.settlement.create(record)
  } else {
    return record
  }
}

module.exports = settlementFactory
