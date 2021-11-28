exports.default = {
  app: {
    orphanRecordsAdopter: process.env.ORPHAN_OWNER,
    location: {
      // max distance to consider a point belonging to a city
      maxDistance: parseInt(process.env.AUTO_LOCATION_MAX_DISTANCE) || 100000,
      // max records per task
      maxRecords: parseInt(process.env.AUTO_LOCATION_MAX_RECORDS) || 10
    },
    // bg atlas 2008 configuration
    bgatlas2008: {
      // size of the grid cell in meters
      gridSize: parseInt(process.env.BG_ATLAS_2008_GRID_SIZE) || 10000,
      // max records per task
      maxRecords: parseInt(process.env.BG_ATLAS_2008_MAX_RECORDS) || 100,
      // consider records newer than this timestamp
      startTimestamp: parseInt(process.env.BG_ATLAS_2008_START_TIMESTAMP) || new Date('2016-01-01').getTime()
    },
    visit: {
      // max records per task
      maxRecords: parseInt(process.env.AUTO_VISIT_MAX_RECORDS) || 100
    }
  }
}

exports.test = {
  app: {
    orphanRecordsAdopter: 'adopt@smartbirds.com'
  }
}
