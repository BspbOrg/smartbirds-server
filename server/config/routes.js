const languages = require('../../config/languages')

exports.default = {
  routes: function (api) {
    return {

      get: [
        { path: '/area/:area/zones', action: 'area:listZones' },
        { path: '/area/:area/zones/:filter', action: 'area:listZones' },
        { path: '/autocomplete', action: 'autocomplete' },
        { path: '/bgatlas/2008', action: 'bgatlas2008_cells_list' },
        { path: '/bgatlas/cell/:utm_code', action: 'bgatlas2008_cell_info' },
        { path: '/bgatlas/cell/:utm_code/stats', action: 'bgatlas2008_cell_stats' },
        { path: '/bgatlas/cell/:utm_code/status', action: 'bgatlas2008_get_cell_status' },
        { path: '/bgatlas/user/selected', action: 'bgatlas2008_get_user_selection' },
        { path: '/bgatlas/stats/user_rank', action: 'bgatlas2008_user_rank_stats' },
        { path: '/bgatlas/moderator/:utm_code/methodology', action: 'bgatlas2008_mod_cell_methodology_stats' },
        { path: '/bgatlas/moderator/:utm_code/user', action: 'bgatlas2008_mod_cell_user_stats' },
        { path: '/docs', action: 'showDocumentation' },
        { path: '/i18n', action: 'i18n' },
        { path: '/locations/', action: 'location:list' },
        { path: '/locations/:id', action: 'location:get' },
        { path: '/locations/:id/zones', action: 'location:listZones' },
        { path: '/locations/:id/zones/:filter', action: 'location:listZones' },
        { path: '/map-layers', action: 'map_layer:types' },
        { path: '/map-layers/:type', action: 'map_layer:typeList' },
        { path: '/map-layers/:type/:id', action: 'map_layer:view' },
        { path: '/nomenclature', action: 'nomenclature:types' },
        { path: '/nomenclature/:type', action: 'nomenclature:typeList' },
        ...Object.keys(languages).map((langId) => {
          return { path: `/nomenclature/:type/${langId}/:value`, action: `nomenclature:${langId}:view` }
        }),
        { path: '/organization', action: 'organization:list' },
        { path: '/pois', action: 'poi:types' },
        { path: '/pois/:type', action: 'poi:typeList' },
        { path: '/pois/:type/:value', action: 'poi:view' },
        { path: '/reports/daily/:date', action: 'daily_report' },
        { path: '/species', action: 'species:types' },
        { path: '/species/:type', action: 'species:typeList' },
        { path: '/species/:type/:value', action: 'species:view' },
        { path: '/status', action: 'status' },
        { path: '/storage/:id', action: 'downloader' },
        { path: '/user', action: 'user:list' },
        { path: '/user/:id', action: 'user:view' },
        { path: '/user/:id/sharers', action: 'user:sharers' },
        { path: '/user/:id/sharees', action: 'user:sharees' },
        { path: '/visit', action: 'visit:list' },
        { path: '/visit/:year', action: 'visit:view' },
        { path: '/zone', action: 'zone:list' },
        { path: '/zone/:id([0-9A-Z]+)', action: 'zone:view' },

        // forms
        { path: '/bats', action: 'formBats:list' },
        { path: '/bats.csv', action: 'formBats:list' },
        { path: '/bats.zip', action: 'formBats:list' },
        { path: '/bats/:id', action: 'formBats:view' },

        { path: '/birds', action: 'formBirds:list' },
        { path: '/birds.csv', action: 'formBirds:list' },
        { path: '/birds.zip', action: 'formBirds:list' },
        { path: '/birds/:id', action: 'formBirds:view' },

        { path: '/birds-migrations', action: 'formBirdsMigrations:list' },
        { path: '/birds-migrations.csv', action: 'formBirdsMigrations:list' },
        { path: '/birds-migrations.zip', action: 'formBirdsMigrations:list' },
        { path: '/birds-migrations/:id', action: 'formBirdsMigrations:view' },

        { path: '/cbm', action: 'formCBM:list' },
        { path: '/cbm.csv', action: 'formCBM:list' },
        { path: '/cbm.zip', action: 'formCBM:list' },
        { path: '/cbm/:id', action: 'formCBM:view' },

        { path: '/ciconia', action: 'formCiconia:list' },
        { path: '/ciconia.csv', action: 'formCiconia:list' },
        { path: '/ciconia.zip', action: 'formCiconia:list' },
        { path: '/ciconia/:id', action: 'formCiconia:view' },

        { path: '/fishes', action: 'formFishes:list' },
        { path: '/fishes.csv', action: 'formFishes:list' },
        { path: '/fishes.zip', action: 'formFishes:list' },
        { path: '/fishes/:id', action: 'formFishes:view' },

        { path: '/herptiles', action: 'formHerptiles:list' },
        { path: '/herptiles.csv', action: 'formHerptiles:list' },
        { path: '/herptiles.zip', action: 'formHerptiles:list' },
        { path: '/herptiles/:id', action: 'formHerptiles:view' },

        { path: '/invertebrates', action: 'formInvertebrates:list' },
        { path: '/invertebrates.csv', action: 'formInvertebrates:list' },
        { path: '/invertebrates.zip', action: 'formInvertebrates:list' },
        { path: '/invertebrates/:id', action: 'formInvertebrates:view' },

        { path: '/mammals', action: 'formMammals:list' },
        { path: '/mammals.csv', action: 'formMammals:list' },
        { path: '/mammals.zip', action: 'formMammals:list' },
        { path: '/mammals/:id', action: 'formMammals:view' },

        { path: '/plants', action: 'formPlants:list' },
        { path: '/plants.csv', action: 'formPlants:list' },
        { path: '/plants.zip', action: 'formPlants:list' },
        { path: '/plants/:id', action: 'formPlants:view' },

        { path: '/pylons', action: 'formPylons:list' },
        { path: '/pylons.csv', action: 'formPylons:list' },
        { path: '/pylons.zip', action: 'formPylons:list' },
        { path: '/pylons/:id', action: 'formPylons:view' },
        { path: '/pylons-casualties', action: 'formPylonsCasualties:list' },
        { path: '/pylons-casualties.csv', action: 'formPylonsCasualties:list' },
        { path: '/pylons-casualties.zip', action: 'formPylonsCasualties:list' },
        { path: '/pylons-casualties/:id', action: 'formPylonsCasualties:view' },

        { path: '/threats', action: 'formThreats:list' },
        { path: '/threats.csv', action: 'formThreats:list' },
        { path: '/threats.zip', action: 'formThreats:list' },
        { path: '/threats/:id', action: 'formThreats:view' },

        { path: '/ebp-species', action: 'ebp:speciesList' },
        { path: '/ebp-species-status', action: 'ebp:speciesStatusList' }
      ],

      post: [
        { path: '/bgatlas/user/selected', action: 'bgatlas2008_set_user_selection' },
        { path: '/organization/:slug', action: 'organization:edit' },
        { path: '/user', action: 'user:create' },
        { path: '/user/:id', action: 'user:edit' },
        { path: '/user/:id/sharees', action: 'user:sharees:update' },
        { path: '/session', action: 'session:create' },
        { path: '/session/:email/resetpw', action: 'user:lost' },
        { path: '/session/:email/resetpw2', action: 'user:reset' },
        { path: '/storage', action: 'uploader' },
        { path: '/tasks/auto-visit', action: 'tasks:enqueue:autoVisit' },
        { path: '/tasks/auto-location', action: 'tasks:enqueue:autoLocation' },
        { path: '/tasks/birds-new-species-moderator-review', action: 'tasks:enqueue:birdsNewSpeciesModeratorReview' },
        { path: '/tasks/bgatlas2008', action: 'tasks:enqueue:bgatlas2008' },
        { path: '/visit/:year', action: 'visit:edit' },
        { path: '/zone/:id/owner', action: 'zone:requestOwnership' },
        { path: '/zone/:id/owner/response', action: 'zone:respondOwnershipRequest' },
        { path: '/tasks/auto-translate-nomenclatures', action: 'tasks:enqueue:autoTranslateNomenclatures' },
        { path: '/tasks/etrs89', action: 'tasks:enqueue:etrs89Codes' },
        { path: '/tasks/ebp-upload', action: 'tasks:enqueue:ebpUpload' },

        // forms
        { path: '/bats', action: 'formBats:create' },
        { path: '/bats/:id', action: 'formBats:edit' },

        { path: '/birds', action: 'formBirds:create' },
        { path: '/birds/:id', action: 'formBirds:edit' },

        { path: '/birds-migrations', action: 'formBirdsMigrations:create' },
        { path: '/birds-migrations/:id', action: 'formBirdsMigrations:edit' },

        { path: '/cbm', action: 'formCBM:create' },
        { path: '/cbm/:id', action: 'formCBM:edit' },

        { path: '/ciconia', action: 'formCiconia:create' },
        { path: '/ciconia/:id', action: 'formCiconia:edit' },

        { path: '/fishes', action: 'formFishes:create' },
        { path: '/fishes/:id', action: 'formFishes:edit' },

        { path: '/herptiles', action: 'formHerptiles:create' },
        { path: '/herptiles/:id', action: 'formHerptiles:edit' },

        { path: '/invertebrates', action: 'formInvertebrates:create' },
        { path: '/invertebrates/:id', action: 'formInvertebrates:edit' },

        { path: '/mammals', action: 'formMammals:create' },
        { path: '/mammals/:id', action: 'formMammals:edit' },

        { path: '/plants', action: 'formPlants:create' },
        { path: '/plants/:id', action: 'formPlants:edit' },

        { path: '/pylons', action: 'formPylons:create' },
        { path: '/pylons/:id', action: 'formPylons:edit' },
        { path: '/pylons-casualties', action: 'formPylonsCasualties:create' },
        { path: '/pylons-casualties/:id', action: 'formPylonsCasualties:edit' },

        { path: '/threats', action: 'formThreats:create' },
        { path: '/threats/:id', action: 'formThreats:edit' },

        // form exports
        { path: '/export/bats', action: 'formBats:export' },
        { path: '/export/birds', action: 'formBirds:export' },
        { path: '/export/birds-migrations', action: 'formBirdsMigrations:export' },
        { path: '/export/cbm', action: 'formCBM:export' },
        { path: '/export/ciconia', action: 'formCiconia:export' },
        { path: '/export/fishes', action: 'formFishes:export' },
        { path: '/export/herptiles', action: 'formHerptiles:export' },
        { path: '/export/invertebrates', action: 'formInvertebrates:export' },
        { path: '/export/mammals', action: 'formMammals:export' },
        { path: '/export/plants', action: 'formPlants:export' },
        { path: '/export/pylons', action: 'formPylons:export' },
        { path: '/export/pylons-casualties', action: 'formPylonsCasualties:export' },
        { path: '/export/threats', action: 'formThreats:export' },

        // form imports
        { path: '/import/bats', action: 'formBats:import' },
        { path: '/import/birds', action: 'formBirds:import' },
        { path: '/import/birds-migrations', action: 'formBirdsMigrations:import' },
        { path: '/import/cbm', action: 'formCBM:import' },
        { path: '/import/ciconia', action: 'formCiconia:import' },
        { path: '/import/fishes', action: 'formFishes:import' },
        { path: '/import/herptiles', action: 'formHerptiles:import' },
        { path: '/import/invertebrates', action: 'formInvertebrates:import' },
        { path: '/import/mammals', action: 'formMammals:import' },
        { path: '/import/plants', action: 'formPlants:import' },
        { path: '/import/pylons', action: 'formPylons:import' },
        { path: '/import/pylons-casualties', action: 'formPylonsCasualties:import' },
        { path: '/import/threats', action: 'formThreats:import' }
      ],

      put: [
        { path: '/map-layers/:type', action: 'map_layer:updateType' },
        { path: '/nomenclature/:type', action: 'nomenclature:updateType' },
        { path: '/pois/:type', action: 'poi:updateType' },
        { path: '/session', action: 'session:check' },
        { path: '/species/:type', action: 'species:updateType' },
        { path: '/zone/:id/owner', action: 'zone:setOwner' },
        { path: '/ebp-species', action: 'ebp:speciesUpdate' },
        { path: '/ebp-species-status', action: 'ebp:speciesStatusUpdate' }
      ],

      patch: [
        { path: '/bgatlas/cell/:utm_code/status', action: 'bgatlas2008_update_cell_status' },
        { path: '/user/:id', action: 'user:changepw' }
      ],

      delete: [
        { path: '/session', action: 'session:destroy' },
        { path: '/user/:id', action: 'user:delete' },
        { path: '/visit/:year', action: 'visit:delete' },
        { path: '/zone/:id/owner', action: 'zone:clearOwner' },

        // forms
        { path: '/bats/:id', action: 'formBats:delete' },
        { path: '/birds/:id', action: 'formBirds:delete' },
        { path: '/birds-migrations/:id', action: 'formBirdsMigrations:delete' },
        { path: '/cbm/:id', action: 'formCBM:delete' },
        { path: '/ciconia/:id', action: 'formCiconia:delete' },
        { path: '/fishes/:id', action: 'formFishes:delete' },
        { path: '/herptiles/:id', action: 'formHerptiles:delete' },
        { path: '/invertebrates/:id', action: 'formInvertebrates:delete' },
        { path: '/mammals/:id', action: 'formMammals:delete' },
        { path: '/plants/:id', action: 'formPlants:delete' },
        { path: '/pylons/:id', action: 'formPylons:delete' },
        { path: '/pylons-casualties/:id', action: 'formPylonsCasualties:delete' },
        { path: '/threats/:id', action: 'formThreats:delete' }
      ]
    }
  }
}
