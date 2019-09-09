var angular = require('angular')

require('../app').directive('listMap', /* @ngInject */function ($filter, $http, db, Track) {
  return {
    templateUrl: '/views/directives/listmap.html',
    scope: {
      rows: '=?',
      ctrl: '=?',
      opts: '<?',
      markerWindowTemplate: '@?'
    },
    bindToController: true,
    controller: /* @ngInject */function ($scope, $state) {
      var $ctrl = this

      angular.extend($ctrl, {
        config: angular.extend({}, {
          haveZones: true,
          haveTracks: true,
          haveDetail: true
        }, $ctrl.opts || {}),
        center: { latitude: 42.744820608, longitude: 25.2151370694 },
        zoom: 8,
        zones: [],
        zonesIndex: {},
        tracksWaiting: 0,
        tracks: [],
        tracksIndex: {},
        options: {},
        selected: {},
        polygon: {
          click: function (polygon, eventName, model) {
            if ($ctrl.selected && $ctrl.selected.zone === model) {
              $ctrl.selected = {}
            } else {
              $ctrl.selected = { zone: model }
            }
          }
        },
        marker: {
          control: {},
          click: function (marker, eventName, model) {
            if ($ctrl.selected && $ctrl.selected.pin === model) {
              if ($ctrl.config.haveDetail) {
                $ctrl.openDetails()
              } else {
                $ctrl.selected = undefined
              }
            } else {
              $ctrl.selected = { pin: model }
            }
          }
        },
        addRows: function (rows) {
          $ctrl.rows = [].concat($ctrl.rows || [], rows || [])
          $ctrl.refresh()
        },
        extractZones: function (rows) {
          (rows || $ctrl.rows).forEach(function (row) {
            if (!row.zone || !db.zones[ row.zone ]) return
            if ($ctrl.zonesIndex[ row.zone ]) return
            $ctrl.zonesIndex[ row.zone ] = $ctrl.zones.length
            $ctrl.zones.push(db.zones[ row.zone ])
          })
        },
        extractTracks: function (rows) {
          (rows || $ctrl.rows).forEach(function (row) {
            if ($ctrl.tracksWaiting >= 3) return
            if (!row.track) return
            if ($ctrl.tracksIndex[ row.track ]) return
            $ctrl.tracksIndex[ row.track ] = true
            $ctrl.tracksWaiting++
            Track.get(row.track).then(function (points) {
              if (!points.length) return
              $ctrl.tracksIndex[ row.track ] = $ctrl.tracks.length
              $ctrl.tracks.push({
                id: $ctrl.tracks.length,
                path: points
              })
            })
              .finally(function () {
                $ctrl.tracksWaiting--
              })
          })
          $ctrl.showTracks = $ctrl.tracksWaiting <= 1
        },
        refresh: function (rows) {
          if ($ctrl.config.haveZones) {
            $ctrl.extractZones(rows)
          }
          if ($ctrl.config.haveTracks) {
            $ctrl.extractTracks(rows)
          }
          if (angular.isFunction($ctrl.marker.control.newModels)) {
            $ctrl.marker.control.newModels($ctrl.rows)
          }
        },
        clear: function () {
          $ctrl.zones = []
          $ctrl.zonesIndex = {}
          $ctrl.rows = {}
          $ctrl.selected = {}
          $ctrl.tracks = []
          $ctrl.tracksIndex = {}
          $ctrl.tracksWaiting = 0
        },
        openDetails: function () {
          $state.go('.detail', { id: $ctrl.selected.pin.id })
        }
      })

      // expose ctrl interface
      if (angular.isObject($ctrl.ctrl)) {
        $ctrl.ctrl.clear = function () {
          if ($ctrl) $ctrl.clear.apply(this, arguments)
        }
        $ctrl.ctrl.refresh = function () {
          if ($ctrl) $ctrl.refresh.apply(this, arguments)
        }
        // prevent memory leaks
        $scope.$on('$destroy', function () {
          delete $ctrl.ctrl.clear
          delete $ctrl.ctrl.refresh
          delete $ctrl.zones
          $ctrl = null
        })
      }
    },
    controllerAs: '$ctrl'
  }
})
