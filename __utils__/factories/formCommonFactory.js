let monitoringSequence = 0

const rnd = (min, max) =>
  Math.random() * (max - min) - min // lgtm [js/insecure-randomness]

async function formCommonFactory (api,
  {
    user = 'user@smartbirds.com',
    userId = api.models.user.findOne({ where: { email: user } }),
    organization = 'bspb',
    latitude,
    longitude,
    observationDateTime = Date.now(),
    monitoringCode = `monitoring ${monitoringSequence++}`,
    startDateTime = observationDateTime,
    endDateTime = observationDateTime
  }
) {
  if (latitude == null) {
    latitude = rnd(-90, 90) // lgtm [js/insecure-randomness]
  }
  if (longitude == null) {
    longitude = rnd(-180, 180) // lgtm [js/insecure-randomness]
  }

  userId = await userId
  return {
    userId: userId.id || userId,
    organization,
    latitude,
    longitude,
    observationDateTime,
    monitoringCode,
    startDateTime,
    endDateTime
  }
}

module.exports = formCommonFactory
