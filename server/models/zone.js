'use strict';
module.exports = function (sequelize, DataTypes) {
  var Zone = sequelize.define('Zone', {
    id: {
      type: DataTypes.STRING(10),
      primaryKey: true
    },
    lat1: DataTypes.DOUBLE,
    lon1: DataTypes.DOUBLE,
    lat2: DataTypes.DOUBLE,
    lon2: DataTypes.DOUBLE,
    lat3: DataTypes.DOUBLE,
    lon3: DataTypes.DOUBLE,
    lat4: DataTypes.DOUBLE,
    lon4: DataTypes.DOUBLE,
    ownerId: DataTypes.INTEGER
  }, {
    indexes: [
      { fields: ['ownerId'] },
      { fields: ['locationId'] }
    ],
    classMethods: {
      associate: function (models) {
        // associations can be defined here
        models.zone.belongsTo(models.user, {as: 'owner'});
        models.zone.belongsTo(models.location, {as: 'location'});
      }
    },
    instanceMethods: {
      apiData: function (api) {
        var data = {
          id: this.id,
          coordinates: [
            {latitude: this.lat1, longitude: this.lon1},
            {latitude: this.lat2, longitude: this.lon2},
            {latitude: this.lat3, longitude: this.lon3},
            {latitude: this.lat4, longitude: this.lon4}
          ],
          locationId: this.locationId,
          ownerId: this.ownerId
        };
        if (this.location) {
          data.location = this.location.apiData(api);
        }
        if (this.owner) {
          data.owner = this.owner.apiData(api);
        }
        return data;
      }
    }
  });
  return Zone;
};
