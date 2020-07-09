module.exports = function (sequelize, DataTypes) {
  return sequelize.define('bgatlas2008_cells', {
    utm_code: {
      type: DataTypes.TEXT,
      primaryKey: true
    },
    lat1: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    lon1: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    lat2: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    lon2: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    lat3: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    lon3: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    lat4: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    lon4: {
      type: DataTypes.DOUBLE,
      allowNull: false
    }
  }, {
    tableName: 'bgatlas2008_cells',
    timestamps: false,
    underscored: true,
    instanceMethods: {
      apiData: function () {
        return {
          utm_code: this.utm_code,
          coordinates: [
            { latitude: this.lat1, longitude: this.lon1 },
            { latitude: this.lat2, longitude: this.lon2 },
            { latitude: this.lat3, longitude: this.lon3 },
            { latitude: this.lat4, longitude: this.lon4 }
          ]
        }
      }
    }
  })
}
