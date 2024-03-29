/**
 * Created by groupsky on 04.12.15.
 */

module.exports = [
  {
    model: 'nomenclature',
    data: {
      type: 'birds_nest_success',
      labelBg: 'Заето гнездо',
      labelEn: 'Occupied nest'
    }
  },
  {
    model: 'nomenclature',
    data: {
      type: 'birds_nest_success',
      labelBg: 'Излетели малки',
      labelEn: 'Fledglings'
    }
  },
  {
    model: 'nomenclature',
    data: {
      type: 'cbm_sector',
      labelBg: '1',
      labelEn: '1'
    }
  },
  {
    model: 'nomenclature',
    data: {
      type: 'cbm_visit_number',
      labelBg: 'E - първо посещение',
      labelEn: 'E - early visit'
    }
  },
  {
    model: 'nomenclature',
    data: {
      type: 'cbm_habitat',
      labelBg: 'A.1 - Широколистни гори',
      labelEn: 'A.1 Broadleaved woodland'
    }
  },
  {
    model: 'nomenclature',
    data: {
      type: 'cbm_habitat',
      labelBg: 'A.2 - Иглолистни гори',
      labelEn: 'A.2 Coniferous woodland'
    }
  },
  {
    model: 'nomenclature',
    data: {
      type: 'cbm_distance',
      labelBg: '3 - (над 100 m)',
      labelEn: '3 - (over 100 m)'
    }
  },
  {
    model: 'nomenclature',
    data: {
      type: 'main_threats',
      labelBg: 'Култивация',
      labelEn: 'Cultivation'
    }
  },
  {
    model: 'nomenclature',
    data: {
      type: 'main_threats',
      labelBg: 'Наторяване',
      labelEn: 'Mulching'
    }
  },
  {
    model: 'nomenclature',
    data: {
      type: 'main_cloud_level',
      labelBg: '33-66%',
      labelEn: '33-66%'
    }
  },
  {
    model: 'nomenclature',
    data: {
      type: 'main_wind_direction',
      labelBg: 'ENE',
      labelEn: 'ENE'
    }
  },
  {
    model: 'nomenclature',
    data: {
      type: 'main_wind_force',
      labelBg: '2 - Лек бриз',
      labelEn: '2 - Light breeze'
    }
  },
  {
    model: 'nomenclature',
    data: {
      type: 'main_rain',
      labelBg: 'Ръми',
      labelEn: 'Drizzle'
    }
  }
]

for (let i = 1; i < 10; i++) {
  module.exports.push(
    {
      model: 'nomenclature',
      data: {
        type: 'testNomenclature',
        labelBg: `Test Nomenclature Bg ${i}`,
        labelEn: `Test Nomenclature En ${i}`
      }
    }
  )
}
