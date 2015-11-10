exports.default = {
  sequelize: function(api){
    return {
      "autoMigrate" : false,
      "loadFixtures": false,
      "dialect"     : "postgres",
      "url"    : process.env.DATABASE_URL,
      "logging"     : false
    };
  }
};

exports.development = {
  sequelize: function(api) {
    return {
      autoMigrate: true,
      logging: console.log,
      url: process.env.DATABASE_URL || 'postgres://smartbirds:secret@localhost/smartbirds'
    }
  }
};
