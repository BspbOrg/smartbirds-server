const languages = require('../../config/languages')

exports.default = {
  routes: function (api) {
    return {

      get: [
        { path: '/user', action: 'user:list' },
        { path: '/user/:id', action: 'user:view' },
        { path: '/user/:id/sharers', action: 'user:sharers' },
        { path: '/user/:id/sharees', action: 'user:sharees' },
        { path: '/zone', action: 'zone:list' },
        { path: '/zone/:id([0-9A-Z]+)', action: 'zone:view' },
        { path: '/locations/', action: 'location:list' },
        { path: '/locations/:id', action: 'location:get' },
        { path: '/locations/:id/zones', action: 'location:listZones' },
        { path: '/locations/:id/zones/:filter', action: 'location:listZones' },
        { path: '/area/:area/zones', action: 'area:listZones' },
        { path: '/area/:area/zones/:filter', action: 'area:listZones' },

        { path: '/docs', action: 'showDocumentation' },
        { path: '/status', action: 'status' },
        { path: '/i18n', action: 'i18n' },

        { path: '/nomenclature', action: 'nomenclature:types' },
        { path: '/nomenclature/:type', action: 'nomenclature:typeList' },
        ...Object.keys(languages).map((langId) => {
          return { path: `/nomenclature/:type/${langId}/:value`, action: `nomenclature:${langId}:view` }
        }),

        { path: '/autocomplete', action: 'autocomplete' },

        { path: '/species', action: 'species:types' },
        { path: '/species/:type', action: 'species:typeList' },
        { path: '/species/:type/:value', action: 'species:view' },

        { path: '/visit', action: 'visit:list' },
        { path: '/visit/:year', action: 'visit:view' },

        { path: '/cbm', action: 'formCBM:list' },
        { path: '/cbm.csv', action: 'formCBM:list' },
        { path: '/cbm.zip', action: 'formCBM:list' },
        { path: '/cbm/:id', action: 'formCBM:view' },

        { path: '/birds', action: 'formBirds:list' },
        { path: '/birds.csv', action: 'formBirds:list' },
        { path: '/birds.zip', action: 'formBirds:list' },
        { path: '/birds/:id', action: 'formBirds:view' },

        { path: '/storage/:id', action: 'downloader' },

        { path: '/herptiles', action: 'formHerptiles:list' },
        { path: '/herptiles.csv', action: 'formHerptiles:list' },
        { path: '/herptiles.zip', action: 'formHerptiles:list' },
        { path: '/herptiles/:id', action: 'formHerptiles:view' },

        { path: '/mammals', action: 'formMammals:list' },
        { path: '/mammals.csv', action: 'formMammals:list' },
        { path: '/mammals.zip', action: 'formMammals:list' },
        { path: '/mammals/:id', action: 'formMammals:view' },

        { path: '/invertebrates', action: 'formInvertebrates:list' },
        { path: '/invertebrates.csv', action: 'formInvertebrates:list' },
        { path: '/invertebrates.zip', action: 'formInvertebrates:list' },
        { path: '/invertebrates/:id', action: 'formInvertebrates:view' },

        { path: '/ciconia', action: 'formCiconia:list' },
        { path: '/ciconia.csv', action: 'formCiconia:list' },
        { path: '/ciconia.zip', action: 'formCiconia:list' },
        { path: '/ciconia/:id', action: 'formCiconia:view' },

        { path: '/plants', action: 'formPlants:list' },
        { path: '/plants.csv', action: 'formPlants:list' },
        { path: '/plants.zip', action: 'formPlants:list' },
        { path: '/plants/:id', action: 'formPlants:view' },

        { path: '/threats', action: 'formThreats:list' },
        { path: '/threats.csv', action: 'formThreats:list' },
        { path: '/threats.zip', action: 'formThreats:list' },
        { path: '/threats/:id', action: 'formThreats:view' },

        { path: '/organization', action: 'organization:list' },

        { path: '/bgatlas/2008', action: 'bgatlas2008_cells_list' },
        { path: '/bgatlas/cell/:utm_code', action: 'bgatlas2008_cell_info' },
        { path: '/bgatlas/cell/:utm_code/stats', action: 'bgatlas2008_cell_stats' },
        { path: '/bgatlas/user/selected', action: 'bgatlas2008_get_user_selection' },
        { path: '/bgatlas/stats/user_rank', action: 'bgatlas2008_user_rank_stats' }
      ],

      post: [
        { path: '/session', action: 'session:create' },
        { path: '/user', action: 'user:create' },
        { path: '/user/:id', action: 'user:edit' },
        { path: '/user/:id/sharees', action: 'user:sharees:update' },
        { path: '/session/:email/resetpw', action: 'user:lost' },
        { path: '/session/:email/resetpw2', action: 'user:reset' },
        { path: '/zone/:id/owner', action: 'zone:requestOwnership' },
        { path: '/zone/:id/owner/response', action: 'zone:respondOwnershipRequest' },
        { path: '/visit/:year', action: 'visit:edit' },
        { path: '/cbm', action: 'formCBM:create' },
        { path: '/cbm/:id', action: 'formCBM:edit' },

        { path: '/birds', action: 'formBirds:create' },
        { path: '/birds/:id', action: 'formBirds:edit' },

        { path: '/storage', action: 'uploader' },

        { path: '/herptiles', action: 'formHerptiles:create' },
        { path: '/herptiles/:id', action: 'formHerptiles:edit' },

        { path: '/mammals', action: 'formMammals:create' },
        { path: '/mammals/:id', action: 'formMammals:edit' },

        { path: '/invertebrates', action: 'formInvertebrates:create' },
        { path: '/invertebrates/:id', action: 'formInvertebrates:edit' },

        { path: '/ciconia', action: 'formCiconia:create' },
        { path: '/ciconia/:id', action: 'formCiconia:edit' },

        { path: '/plants', action: 'formPlants:create' },
        { path: '/plants/:id', action: 'formPlants:edit' },

        { path: '/threats', action: 'formThreats:create' },
        { path: '/threats/:id', action: 'formThreats:edit' },

        { path: '/export/cbm', action: 'formCBM:export' },
        { path: '/export/birds', action: 'formBirds:export' },
        { path: '/export/herptiles', action: 'formHerptiles:export' },
        { path: '/export/mammals', action: 'formMammals:export' },
        { path: '/export/invertebrates', action: 'formInvertebrates:export' },
        { path: '/export/plants', action: 'formPlants:export' },
        { path: '/export/ciconia', action: 'formCiconia:export' },
        { path: '/export/threats', action: 'formThreats:export' },

        { path: '/organization/:slug', action: 'organization:edit' },

        { path: '/tasks/auto-location', action: 'tasks:enqueue:autoLocation' },
        { path: '/tasks/bgatlas2008', action: 'tasks:enqueue:bgatlas2008' },

        { path: '/bgatlas/user/selected', action: 'bgatlas2008_set_user_selection' }
      ],

      put: [
        { path: '/session', action: 'session:check' },
        { path: '/zone/:id/owner', action: 'zone:setOwner' },
        { path: '/nomenclature/:type', action: 'nomenclature:updateType' },
        { path: '/species/:type', action: 'species:updateType' }
      ],

      patch: [
        { path: '/user/:id', action: 'user:changepw' }
      ],

      delete: [
        { path: '/session', action: 'session:destroy' },
        { path: '/user/:id', action: 'user:delete' },
        { path: '/zone/:id/owner', action: 'zone:clearOwner' },
        { path: '/cbm/:id', action: 'formCBM:delete' },
        { path: '/visit/:year', action: 'visit:delete' },
        { path: '/birds/:id', action: 'formBirds:delete' },
        { path: '/herptiles/:id', action: 'formHerptiles:delete' },
        { path: '/mammals/:id', action: 'formMammals:delete' },
        { path: '/invertebrates/:id', action: 'formInvertebrates:delete' },
        { path: '/ciconia/:id', action: 'formCiconia:delete' },
        { path: '/plants/:id', action: 'formPlants:delete' },
        { path: '/threats/:id', action: 'formThreats:delete' }
      ]
    }
  }
}
