// Suppress DEP0174 warning specifically
const originalEmitWarning = process.emitWarning
process.emitWarning = function (warning, type, code) {
  if (code === 'DEP0174') {
    return // Suppress this specific warning
  }
  return originalEmitWarning.apply(process, arguments)
}
