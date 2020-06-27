exports.default = {
  app: {
    orphanRecordsAdopter: process.env.ORPHAN_OWNER,
    location: {
      // max distance to consider a point belonging to a city
      maxDistance: process.env.AUTO_LOCATION_MAX_DISTANCE || 100000,
      // max records per task
      maxRecords: process.env.AUTO_LOCATION_MAX_RECORDS || 10
    }
  }
}

exports.test = {
  app: {
    orphanRecordsAdopter: 'adopt@smartbirds.com'
  }
}
