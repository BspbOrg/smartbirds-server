exports.default = {
  app: {
    orphanRecordsAdopter: process.env.ORPHAN_OWNER
  }
}

exports.test = {
  app: {
    orphanRecordsAdopter: 'adopt@smartbirds.com'
  }
}
