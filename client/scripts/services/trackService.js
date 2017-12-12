var simplify = require('simplify-js')

require('../app').service('Track', /* @ngInject */function ($filter, $http) {
  var authurl = $filter('authurl')

  this.get = function (trackUrl) {
    return $http({ url: authurl(trackUrl) })
      .then(function (response) {
        if (!response || !response.data || !response.data.gpx || !response.data.gpx.trk || !response.data.gpx.trk.trkseg) return []
        var points = []
        response.data.gpx.trk.trkseg.forEach(function (trkseg) {
          var trkpt = trkseg.trkpt
          if (!trkpt || !trkpt._lat || !trkpt._lon) return
          var pp = {
            latitude: parseFloat(trkpt._lat),
            x: parseFloat(trkpt._lat),
            longitude: parseFloat(trkpt._lon),
            y: parseFloat(trkpt._lon)
          }
          points.push(pp)
        })
        return simplify(points, 0.0001)
      })
  }
})
