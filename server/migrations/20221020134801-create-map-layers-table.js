'use strict'

const { DataTypes } = require('sequelize')
const tableName = 'MapLayers'
const languages = ['Bg', 'Sq', 'Mk', 'El', 'Tr', 'Ar', 'Fr']

const DEFAULT_TILE_WIDTH = 256
const DEFAULT_TILE_HEIGHT = 256

const records = {
  general: [
    // SPA
    {
      labelEn: 'SPA',
      summaryEn: 'Show special protected areas by Natura 2000 in Bulgaria',
      labelBg: 'ЗЗ "Птици"',
      summaryBg: 'Слой на защитени зони за птиците по Натура 2000 в България',
      urlEn: 'https://gis.bspb.org/geoserver/gwc/service/tms/1.0.0/geonode%%3AspaSmartEn/%d/%d/%d.png',
      urlBg: 'https://gis.bspb.org/geoserver/gwc/service/tms/1.0.0/geonode%%3AspaSmart/%d/%d/%d.png'
    },
    // Random cells
    {
      labelEn: 'Squares "Atlas - 1 km"',
      summaryEn: 'Show of randomly selected squares for the methodology "Atlas - 1 km"; red - required, blue - replacement',
      labelBg: 'Квадрати "Атлас - 1 km"',
      summaryBg: 'Показване на случайно избрани квадрати за методиката "Атлас - 1 km"; червено - задължителни, синьо - допълнителни',
      urlEn: 'https://gis.bspb.org/geoserver/gwc/service/tms/1.0.0/geonode%%3Agrid1kmRandom/%d/%d/%d.png'
    },
    // Grid 1km
    {
      labelEn: 'UTM grid 1 km',
      summaryEn: 'Show entire UTM grid 1 km on the territory of Bulgaria',
      labelBg: 'UTM грид 1 km',
      summaryBg: 'Показване на грид 1 km на територията на България',
      urlEn: 'https://gis.bspb.org/geoserver/gwc/service/tms/1.0.0/geonode%%3Agrid1km/%d/%d/%d.png'
    },
    // Grid 10km
    {
      labelEn: 'UTM grid 10 km',
      summaryEn: 'Show entire UTM grid 10 km on the territory of Bulgaria',
      labelBg: 'UTM грид 10 km',
      summaryBg: 'Показване на UTM грид 10 km на територията на България',
      urlEn: 'https://gis.bspb.org/geoserver/gwc/service/tms/1.0.0/geonode%%3AUTMgrid_do_granica/%d/%d/%d.png'
    }
  ]
}

module.exports = {
  async up (queryInterface) {
    await queryInterface.createTable(tableName, {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      type: {
        type: DataTypes.STRING(32),
        allowNull: false
      },
      labelEn: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      ...Object.fromEntries(languages.map(lang => [`label${lang}`, DataTypes.TEXT])),
      summaryEn: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      ...Object.fromEntries(languages.map(lang => [`summary${lang}`, DataTypes.TEXT])),
      urlEn: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      ...Object.fromEntries(languages.map(lang => [`url${lang}`, DataTypes.TEXT])),
      tileWidth: DataTypes.INTEGER,
      tileHeight: DataTypes.INTEGER,
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    })

    await queryInterface.bulkInsert(tableName, Object.entries(records).flatMap(([type, values]) => values.map((value) => ({
      createdAt: new Date(),
      updatedAt: new Date(),
      type,
      tileWidth: DEFAULT_TILE_WIDTH,
      tileHeight: DEFAULT_TILE_HEIGHT,
      enabled: true,
      ...value
    }))))
  },

  async down (queryInterface) {
    await queryInterface.dropTable(tableName)
  }
}
