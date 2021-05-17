let visitSequence = 2021

async function visitFactory (
  api,
  {
    year = visitSequence++,
    earlyStart = new Date(year, 3, 15).getTime(),
    earlyEnd = earlyStart + 30, // + 30 days
    lateStart = earlyEnd + 30, // + 30 days
    lateEnd = lateStart + 30 // + 30 days
  } = {}
) {
  return api.models.visit.create({
    year,
    earlyStart,
    earlyEnd,
    lateStart,
    lateEnd
  })
}

module.exports = visitFactory
