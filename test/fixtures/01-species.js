module.exports = [
  {
    model: 'species',
    data: {
      type: 'birds',
      labelLa: 'Accipiter nisus',
      labelBg: 'Малък ястреб',
      labelEn: 'Eurasian Sparrowhawk'
    }
  },
  {
    model: 'species',
    data: {
      type: 'birds',
      labelLa: 'Aix sponsa',
      labelBg: 'Каролинка',
      labelEn: 'Wood Duck'
    }
  },
  {
    model: 'species',
    data: {
      type: 'birds',
      labelLa: 'Alle alle',
      labelBg: 'Малка гагарка',
      labelEn: 'Little auk'
    }
  },
  {
    model: 'species',
    data: {
      type: 'birds',
      labelLa: 'Acrocephalus agricola',
      labelBg: 'Индийско шаварче',
      labelEn: 'Paddyfield Warbler'
    }
  },
  {
    model: 'species',
    data: {
      type: 'invertebrates',
      labelLa: 'Lucanus cervus'
    }
  },
  {
    model: 'species',
    data: {
      type: 'mammals',
      labelLa: 'Accipiter nisus'
    }
  },
  {
    model: 'species',
    data: {
      type: 'mammals',
      labelLa: 'Aix sponsa'
    }
  },
  {
    model: 'species',
    data: {
      type: 'mammals',
      labelLa: 'Acrocephalus agricola'
    }
  },
  {
    model: 'species',
    data: {
      type: 'herptiles',
      labelLa: 'Accipiter nisus'
    }
  },
  {
    model: 'species',
    data: {
      type: 'herptiles',
      labelLa: 'Aix sponsa'
    }
  },
  {
    model: 'species',
    data: {
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
  },
  {
    model: 'species',
    data: {
      type: 'plants',
      labelLa: 'Sternbergia colchiciflora'
    }
  },
  {
    model: 'species',
    data: {
      type: 'fishes',
      labelLa: 'Eudontomyzon mariae'
    }
  },
  {
    model: 'species',
    data: {
      type: 'bats',
      labelLa: 'Myotis sp.'
    }
  },
]

for (let i = 1; i < 10; i++) {
  module.exports.push(
    {
      model: 'species',
      data: {
        type: 'testSpecies',
        labelLa: `Test Species La ${i}`,
        labelBg: `Test Species Bg ${i}`,
        labelEn: `Test Species En ${i}`
      }
    }
  )
}
