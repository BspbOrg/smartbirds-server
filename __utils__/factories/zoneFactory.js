let zoneSequence = 0

async function zoneFactory (api, propOverrides) {
  return api.models.zone.create({
    id: `T${zoneSequence++}`,
    lon1: zoneSequence / 100,
    lat1: zoneSequence / 100,
    lon2: (zoneSequence + 1) / 100,
    lat2: zoneSequence / 100,
    lon3: (zoneSequence + 1) / 100,
    lat3: (zoneSequence + 1) / 100,
    lon4: zoneSequence / 100,
    lat4: (zoneSequence + 1) / 100,
    ...propOverrides
  })
}

module.exports = zoneFactory
