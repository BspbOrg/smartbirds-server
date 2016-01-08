/**
 * Created by dani on 06.01.16.
 */

'use strict';
module.exports = function (sequelize, DataTypes) {
  var FormCBM = sequelize.define('FormCBM',{
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    plotSlug: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    visitSlug: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    secondaryHabitatSlug: DataTypes.STRING(128),
    primaryHabitatSlug: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    distanceSlug: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    speciesSlug: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    notes: DataTypes.TEXT,
    visibility: DataTypes.FLOAT,
    mto: DataTypes.TEXT,
    cloudinessSlug: DataTypes.STRING(128),
    cloudsType: DataTypes.TEXT,
    windDirectionSlug: DataTypes.STRING(128),
    windSpeedSlug: DataTypes.STRING(128),
    temperature: DataTypes.FLOAT,
    rainSlug: DataTypes.STRING(128),
    observers: DataTypes.TEXT,
    endTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    zoneId: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    sourceSlug: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    indexes: [
      {fields: ['zoneId']},
      {fields: ['userId']}
    ],
    classMethods: {
      associate: function (models) {
        // define nomenclature relations
        models.formCBM.belongsTo(models.nomenclature, {as: 'plot', foreignKey: 'plotSlug', targetKey: 'slug'});
        models.formCBM.belongsTo(models.nomenclature, {as: 'visit', foreignKey: 'visitSlug', targetKey: 'slug'});
        models.formCBM.belongsTo(models.nomenclature, {as: 'secondaryHabitat', foreignKey: 'secondaryHabitatSlug', targetKey: 'slug'});
        models.formCBM.belongsTo(models.nomenclature, {as: 'primaryHabitat', foreignKey: 'primaryHabitatSlug', targetKey: 'slug'});
        models.formCBM.belongsTo(models.nomenclature, {as: 'distance', foreignKey: 'distanceSlug', targetKey: 'slug'});
        models.formCBM.belongsTo(models.nomenclature, {as: 'species', foreignKey: 'speciesSlug', targetKey: 'slug'});
        models.formCBM.belongsTo(models.nomenclature, {as: 'cloudiness', foreignKey: 'cloudinessSlug', targetKey: 'slug'});
        models.formCBM.belongsTo(models.nomenclature, {as: 'windDirection', foreignKey: 'windDirectionSlug', targetKey: 'slug'});
        models.formCBM.belongsTo(models.nomenclature, {as: 'windSpeed', foreignKey: 'windSpeedSlug', targetKey: 'slug'});
        models.formCBM.belongsTo(models.nomenclature, {as: 'rain', foreignKey: 'rainSlug', targetKey: 'slug'});
        models.formCBM.belongsTo(models.nomenclature, {as: 'source', foreignKey: 'sourceSlug', targetKey: 'slug'});
        models.formCBM.belongsToMany(models.nomenclature, {as: 'threats', through: 'FormCBMThreats', foreignKey: 'threatsSlug', targetKey: 'slug'});

        // other relations
        models.formCBM.belongsTo(models.zone);
        models.formCBM.belongsTo(models.user, {as: 'submitter'});
      }
    },
    instanceMethods: {
      apiData: function (api) {
        var data = {
          id: this.id,
          notes: this.notes
        };
        return data;
      }
    }
  });
  return FormCBM;
};
