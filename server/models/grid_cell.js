module.exports = function (sequelize, DataTypes) {
  return sequelize.define('GridCell', {
    gridId: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    cellId: {
      type: DataTypes.TEXT,
      allowNull: false
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
    instanceMethods: {
      apiData: function () {
        return {
          gridId: this.gridId,
          cellId: this.cellId,
          coordinates: [
            { latitude: this.lat1, longitude: this.lon1 },
            { latitude: this.lat2, longitude: this.lon2 },
            { latitude: this.lat3, longitude: this.lon3 },
            { latitude: this.lat4, longitude: this.lon4 }
          ]
        }
      }
    },
    timestamps: false,
    underscored: true
  })
}
