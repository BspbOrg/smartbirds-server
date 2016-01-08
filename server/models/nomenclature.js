'use strict';
module.exports = function (sequelize, DataTypes) {

  var Nomenclature, attributes, options;

  attributes = {
    "type": {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    "slug": {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    "labelBg": DataTypes.STRING,
    "labelEn": DataTypes.STRING
  };

  options = {
    "indexes": [
      {
        "unique": true,
        "fields": ["type", "slug"]
      }
    ],
    "instanceMethods": {
      apiData: function (api) {
        return {
          type: this.type,
          slug: this.slug,
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
