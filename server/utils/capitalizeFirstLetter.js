module.exports = function capitalizeFirstLetter (string) {
  if (string == null) return ''
  return string.charAt(0).toUpperCase() + string.slice(1)
}
