/**
 * Created by dani on 06.01.16.
 */

'use strict';

var Promise = require('bluebird');

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
        models.formCBM.belongsTo(models.zone, {as: 'zone'});
        models.formCBM.belongsTo(models.user, {as: 'user'});
      }
    },
    instanceMethods: {
      apiData: function (api) {
        var data = {id: this.id};
        var self = this;
        return Promise.all([
          self.getPlot({where: {type: 'cbm_sector'}}).then(function(res){data.plot = res && res.apiData()}),
          self.getVisit({where: {type: 'cbm_visit_number'}}).then(function(res){data.visit = res && res.apiData()}),
          self.getSecondaryHabitat({where: {type: 'cbm_habitat'}}).then(function(res){data.secondaryHabitat = res && res.apiData()}),
          self.getPrimaryHabitat({where: {type: 'cbm_habitat'}}).then(function(res){data.primaryHabitat = res && res.apiData()}),
          self.getDistance({where: {type: 'cbm_distance'}}).then(function(res){data.distance = res && res.apiData()}),
          self.getSpecies({where: {type: 'birds_name'}}).then(function(res){data.species = res && res.apiData()}),
          self.getCloudiness({where: {type: 'main_cloud_level'}}).then(function(res){data.cloudiness = res && res.apiData()}),
          self.getWindDirection({where: {type: 'main_wind_direction'}}).then(function(res){data.windDirection = res && res.apiData()}),
          self.getWindSpeed({where: {type: 'main_wind_force'}}).then(function(res){data.windSpeed = res && res.apiData()}),
          self.getRain({where: {type: 'main_rain'}}).then(function(res){data.rain = res && res.apiData()}),
          self.getSource({where: {type: 'main_source'}}).then(function(res){data.source = res && res.apiData()}),
          self.getZone({include: [{model: api.models.location, as: 'location'}]}).then(function(res){data.zone = res && res.apiData()}),
          self.getUser().then(function(res){data.user = res && res.apiData()}),
        ]).then(function() {
          data.count = self.count;
          data.notes = self.notes;
          data.visibility = self.visibility;
          data.mto = self.mto;
          data.cloudsType = self.cloudsType;
          data.temperature = self.temperature;
          data.observers = self.observers;
          data.endTime = self.endTime;
          data.endDate = self.endDate;
          data.startTime = self.startTime;
          data.startDate = self.startDate;
          data.latitude = self.latitude;
          data.longitude = self.longitude;

          return data;
        });
      }
    }
  });
  return FormCBM;
};
