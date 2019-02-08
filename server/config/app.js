exports.default = {
  app: {
    orphanRecordsAdopter: process.env.ORPHAN_OWNER,
    latKilometersPerDegree: 111.195,
    lonKilometersPerDegree: 82.445
  }
}

exports.test = {
  app: {
    orphanRecordsAdopter: 'adopt@smartbirds.com'
  }
}
