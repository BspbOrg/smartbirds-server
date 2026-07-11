exports.default = {
  pagination: function (api) {
    return {
      // Hard ceiling for an interactive sensitive-record list response
      // (<form>:list), applied to every role.
      formListMax: 1000,
      // Hard ceiling for a single export (<form>:export).
      formExportMax: 50000,
      // Hard ceiling for the user directory (user:list).
      userListMax: 5000,
      // Hard ceiling for zone:list.
      zoneListMax: 50000,
      // Hard ceiling for the admin suspicious-activity alert listing.
      alertListMax: 500,
      // Anonymous "public" context ceiling, reduced by the offset.
      publicMax: 1000
    }
  }
}
