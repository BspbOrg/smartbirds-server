exports.default = {
  app: {
    orphanRecordsAdopter: process.env.ORPHAN_OWNER,
    latKilometersPerDegree: 111.195,
    lonKilometersPerDegree: 82.445,
    location: {
      // max distance to consider a point belonging to a city
      maxDistance: 50000,
      // max records per task
      maxRecords: 10
    }
  }
}

exports.test = {
  app: {
    orphanRecordsAdopter: 'adopt@smartbirds.com'
  }
}
