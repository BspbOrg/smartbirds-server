exports.default = {
  app: {
    orphanRecordsAdopter: process.env.ORPHAN_OWNER,
    location: {
      // max distance to consider a point belonging to a city
      maxDistance: process.env.AUTO_LOCATION_MAX_DISTANCE || 100000,
      // max records per task
      maxRecords: process.env.AUTO_LOCATION_MAX_RECORDS || 10
    },
    // bg atlas 2008 configuration
    bgatlas2008: {
      // size of the grid cell in meters
      gridSize: 10000,
      // max records per task
      maxRecords: process.env.BG_ATLAS_2008_MAX_RECORDS || 100
    }
  }
}

exports.test = {
  app: {
    orphanRecordsAdopter: 'adopt@smartbirds.com'
  }
}
