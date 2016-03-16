'use strict';
module.exports = function (sequelize, DataTypes) {

  var Nomenclature, attributes, options;

  attributes = {
    "type": {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    "labelBg": DataTypes.TEXT,
    "labelEn": DataTypes.TEXT
  };

  options = {
    "indexes": [
      {
        "unique": true,
        "fields": ["type", "labelBg"]
      },
      {
        "unique": true,
        "fields": ["type", "labelEn"]
      }
    ],
    "instanceMethods": {
      apiData: function (api) {
        return {
          type: this.type,
          label: {
            bg: this.labelBg,
            en: this.labelEn
          }
        };
      }
    }
  };

  Nomenclature = sequelize.define('Nomenclature', attributes, options);

  return Nomenclature;
};
