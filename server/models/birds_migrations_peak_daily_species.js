module.exports = function (sequelize, DataTypes) {
  return sequelize.define('birds_migrations_peak_daily_species', {
    observation_date: {
      type: DataTypes.DATE,
      primaryKey: true
    },
    season: {
      type: DataTypes.TEXT,
      primaryKey: true
    },
    migration_point_en: {
      type: DataTypes.TEXT,
      primaryKey: true
    },
    species: {
      type: DataTypes.TEXT,
      primaryKey: true
    },
    count: DataTypes.INTEGER
  }, {
    timestamps: false,
    tableName: 'birds_migrations_peak_daily_species',
    classMethods: {
      associate: function ({ poi, species }) {
        this.belongsTo(species, {
          as: 'speciesInfo',
          foreignKey: 'species',
          targetKey: 'labelLa',
          scope: { type: 'birds' }
        })
        this.belongsTo(poi, {
          as: 'migrationPoint',
          foreignKey: 'migration_point_en',
          targetKey: 'labelEn',
          scope: { type: 'birds_migration_point' }
        })
      }
    },
    instanceMethods: {
      apiData: function (api) {
        return {
          date: this.observation_date,
          season: this.season,
          migrationPoint: this.migrationPoint ? this.migrationPoint.apiData(api) : null,
          species: this.speciesInfo ? this.speciesInfo.apiData(api, 'public') : null,
          count: this.count
        }
      }
    }
  })
}
