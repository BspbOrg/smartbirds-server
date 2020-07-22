let monitoringSequence = 0

async function formCommonFactory (api,
  {
    user = 'user@smartbirds.com',
    userId = api.models.user.findOne({ where: { email: user } }),
    organization = 'bspb',
    latitude = Math.random() * 180 - 90,
    longitude = Math.random() * 360 - 180,
    observationDateTime = Date.now(),
    monitoringCode = `monitoring ${monitoringSequence++}`,
    startDateTime = observationDateTime,
    endDateTime = observationDateTime
  } // lgtm[js/insecure-randomness]
) {
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
