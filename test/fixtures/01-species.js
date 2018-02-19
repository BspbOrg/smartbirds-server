module.exports = [
  {
    model: 'species',
    data: {
      id: 1,
      type: 'birds',
      labelLa: 'Accipiter nisus',
      labelBg: 'Малък ястреб',
      labelEn: 'Eurasian Sparrowhawk'
    }
  },
  {
    model: 'species',
    data: {
      id: 2,
      type: 'birds',
      labelLa: 'Aix sponsa',
      labelBg: 'Каролинка',
      labelEn: 'Wood Duck'
    }
  },
  {
    model: 'species',
    data: {
      id: 3,
      type: 'birds',
      labelLa: 'Alle alle',
      labelBg: 'Малка гагарка',
      labelEn: 'Little auk'
    }
  },
  {
    model: 'species',
    data: {
      id: 4,
      type: 'birds',
      labelLa: 'Acrocephalus agricola',
      labelBg: 'Индийско шаварче',
      labelEn: 'Paddyfield Warbler'
    }
  },
  {
    model: 'species',
    data: {
      id: 5,
      type: 'invertebrates',
      labelLa: 'Lucanus cervus'
    }
  },
  {
    model: 'species',
    data: {
      id: 6,
      type: 'mammals',
      labelLa: 'Accipiter nisus'
    }
  },
  {
    model: 'species',
    data: {
      id: 7,
      type: 'mammals',
      labelLa: 'Aix sponsa'
    }
  },
  {
    model: 'species',
    data: {
      id: 8,
      type: 'mammals',
      labelLa: 'Acrocephalus agricola'
    }
  },
  {
    model: 'species',
    data: {
      id: 9,
      type: 'herptiles',
      labelLa: 'Accipiter nisus'
    }
  },
  {
    model: 'species',
    data: {
      id: 10,
      type: 'herptiles',
      labelLa: 'Aix sponsa'
    }
  },
  {
    model: 'species',
    data: {
      id: 11,
      type: 'herptiles',
      labelLa: 'Acrocephalus agricola'
    }
  },
  {
    model: 'species',
    data: {
      type: 'herp',
      labelLa: 'Accipiter nisus'
    }
  },
  {
    model: 'species',
    data: {
      type: 'herp',
      labelLa: 'Aix sponsa'
    }
  },
  {
    model: 'species',
    data: {
      type: 'herp',
      labelLa: 'Acrocephalus agricola'
    }
  },
  {
    model: 'species',
    data: {
      type: 'birds',
      labelLa: 'Duplicated'
    }
  },
  {
    model: 'species',
    data: {
      type: 'herptiles',
      labelLa: 'Duplicated'
    }
  }
]

for (let i = 1; i < 10; i++) {
  module.exports.push({
      model: 'species',
      data: {
        type: 'testSpecies',
        labelLa: `Test Species La ${i}`,
        labelBg: `Test Species Bg ${i}`,
        labelEn: `Test Species En ${i}`,
      }
    }
  )
}
