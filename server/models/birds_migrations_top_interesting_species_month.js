module.exports = function (sequelize, DataTypes) {
  return sequelize.define('birds_migrations_top_interesting_species_month', {
    form_name: {
      type: DataTypes.TEXT,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    species: {
      type: DataTypes.TEXT,
      primaryKey: true
    },
    migration_point_en: {
      type: DataTypes.TEXT,
      primaryKey: true
    },
    observationDateTime: {
      type: DataTypes.DATE,
      primaryKey: true
    },
    count: DataTypes.INTEGER
  }, {
    timestamps: false,
    tableName: 'birds_migrations_top_interesting_species_month',
    classMethods: {
      associate: function ({ poi, species, user }) {
        this.belongsTo(user, {
          as: 'user',
          foreignKey: 'user_id'
        })
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
          form: this.form_name,
          observer: this.user ? this.user.apiData(api, 'public') : null,
          species: this.speciesInfo ? this.speciesInfo.apiData(api, 'public') : null,
          migrationPoint: this.migrationPoint ? this.migrationPoint.apiData(api) : null,
          date: this.observation_date_time,
          count: this.count
        }
      }
    }
  })
}
