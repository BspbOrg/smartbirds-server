let monitoringSequence = 0

async function formCommonFactory (api, {
  user = 'user@smartbirds.com',
  userId = api.models.user.findOne({ where: { email: user } }),
  organization = 'bspb',
  latitude = Math.random() * 180 - 90, // lgtm[js/insecure-randomness]
  longitude = Math.random() * 360 - 180, // lgtm[js/insecure-randomness]
  observationDateTime = Date.now(),
  monitoringCode = `monitoring ${monitoringSequence++}`,
  startDateTime = observationDateTime,
  endDateTime = observationDateTime
}) {
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
