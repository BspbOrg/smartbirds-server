const addDays = require('date-fns/add_days')
const format = require('date-fns/format')

const baseModelFields = {
    latitude: 42.1463749,
    longitude: 24.7492006,
    endDateTime: '2015-12-10T11:15Z',
    startDateTime: '2015-12-10T09:15Z',
    observationDateTime: '2015-12-10T10:15:01Z',
    location: 'some location',
    observers: 'Some test observers'
}
exports.formCBM = (opts) => {
  const i = exports.formCBM.index++
  return {
    ...baseModelFields,
    observationDateTime:format(addDays('2015-12-10T10:15:01', i), 'YYYY-MM-DDTHH:mm:ss[Z]'),
    monitoringCode: `random_CBM_${i}`,
    zoneId: 1,
    plotBg: `${i}`,
    plotEn: `${i}`,
    visitBg: 'e-early-visit',
    visitEn: 'e-early-visit',
    primaryHabitatBg: 'a-2-coniferous-woodland',
    primaryHabitatEn: 'a-2-coniferous-woodland',
    count: i,
    distanceBg: '3-over-100-m',
    distanceEn: '3-over-100-m',
    species: 'Accipiter nisus',
    ...opts
  }
}

exports.formBirds = (opts) => {
  const i = exports.formBirds.index++
  return {
    ...baseModelFields,
    observationDateTime:format(addDays('2015-12-10T10:15:01', i), 'YYYY-MM-DDTHH:mm:ss[Z]'),
    monitoringCode: `random_birds_${i}`,
    countUnitBg: 'Индивиди',
    countUnitEn: 'Individuals',
    typeUnitBg: 'Точен брой',
    typeUnitEn: 'Exact number',
    count: i,
    countMin: i,
    countMax: i,
    species: 'Accipiter nisus',
    ...opts
  }
}

exports.formCiconia = (opts) => {
  const i = exports.formCiconia.index++
  return {
    ...baseModelFields,
    observationDateTime:format(addDays('2015-12-10T10:15:01', i), 'YYYY-MM-DDTHH:mm:ss[Z]'),
    monitoringCode: `random_ciconia_${i}`,
    nestThisYearNotUtilizedByWhiteStorksEn: 'ciconia_not_occupied',
    nestThisYearNotUtilizedByWhiteStorksBg: 'ciconia_not_occupied',
    thisYearOneTwoBirdsAppearedInNestEn: 'ciconia_new_birds',
    thisYearOneTwoBirdsAppearedInNestBg: 'ciconia_new_birds',
    approximateDateStorksAppeared: '2015-03-10T12:15Z',
    approximateDateDisappearanceWhiteStorks: '2015-08-10T12:15Z',
    thisYearInTheNestAppearedEn: 'ciconia_new_birds',
    thisYearInTheNestAppearedBg: 'ciconia_new_birds',
    countJuvenilesInNest: i,
    nestNotUsedForOverOneYear: i,
    dataOnJuvenileMortalityFromElectrocutions: i,
    dataOnJuvenilesExpelledFromParents: i,
    diedOtherReasons: i,
    ...opts
  }
}

exports.formHerptiles = (opts) => {
  const i = exports.formHerptiles.index++
  return {
    ...baseModelFields,
    observationDateTime:format(addDays('2015-12-10T10:15:01', i), 'YYYY-MM-DDTHH:mm:ss[Z]'),
    monitoringCode: `random_herptile_${i}`,
    species: 'Accipiter nisus',
    count: i,
    marking: 'some marking',
    axisDistance: 1.23,
    weight: 102,
    sCLL: 2.3,
    mPLLcdC: 1.2,
    mCWA: 3.4,
    hLcapPl: 4.5,
    tempSubstrat: 5.4,
    tempAir: 6.5,
    tempCloaca: 3.3,
    sqVentr: 0.13,
    sqCaud: 0.34,
    sqDors: 23,
    ...opts
  }
}

exports.formMammals = (opts) => {
  const i = exports.formMammals.index++
  return {
    ...baseModelFields,
    observationDateTime:format(addDays('2015-12-10T10:15:01', i), 'YYYY-MM-DDTHH:mm:ss[Z]'),
    monitoringCode: `random_mammal_${i}`,
    species: 'Accipiter nisus',
    count: i,
    marking: 'some marking',
    axisDistance: 1.23,
    weight: 102,
    L: 2.3,
    C: 1.2,
    A: 3.4,
    Pl: 4.5,
    tempSubstrat: 5.4,
    tempAir: 6.5,
    ...opts
  }
}

exports.formPlants = (opts) => {
  const i = exports.formPlants.index++
  return {
    ...baseModelFields,
    observationDateTime:format(addDays('2015-12-10T10:15:01', i), 'YYYY-MM-DDTHH:mm:ss[Z]'),
    monitoringCode: `random_plants_${i}`,
    species: 'Sternbergia colchiciflora',
    ...opts
  }
}

exports.formInvertebrates = (opts) => {
  const i = exports.formInvertebrates.index++
  return {
    ...baseModelFields,
    observationDateTime:format(addDays('2015-12-10T10:15:01', i), 'YYYY-MM-DDTHH:mm:ss[Z]'),
    monitoringCode: `random_invertebrates_${i}`,
    species: 'Lucanus cervus',
    count: i,
    marking: 'some marking',
    ...opts
  }
}

exports.formThreats = (opts) => {
  const i = exports.formThreats.index++
  return {
    ...baseModelFields,
    observationDateTime:format(addDays('2015-12-10T10:15:01', i), 'YYYY-MM-DDTHH:mm:ss[Z]'),
    monitoringCode: `random_threats_${i}`,
    categoryBg: 'Пожар',
    categoryEn: 'Fire',
    primaryType: 'threat',
    ...opts
  }
}

exports.formCBM.index = 1
exports.formBirds.index = 1
exports.formHerptiles.index = 1
exports.formMammals.index = 1
exports.formCiconia.index = 1
exports.formPlants.index = 1
exports.formInvertebrates.index = 1
exports.formThreats.index = 1
