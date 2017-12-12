exports.default = {
  routes: function (api) {
    return {

      get: [
        { path: '/user', action: 'user:list' },
        { path: '/user/:id', action: 'user:view' },
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
        { path: '/nomenclature/:type/bg/:value', action: 'nomenclature:bg:view' },
        { path: '/nomenclature/:type/en/:value', action: 'nomenclature:en:view' },

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

        { path: '/herp', action: 'formHerps:list' },
        { path: '/herp.csv', action: 'formHerps:list' },
        { path: '/herp.zip', action: 'formHerps:list' },
        { path: '/herp/:id', action: 'formHerps:view' },

        { path: '/herptiles', action: 'formHerptiles:list' },
        { path: '/herptiles.csv', action: 'formHerptiles:list' },
        { path: '/herptiles.zip', action: 'formHerptiles:list' },
        { path: '/herptiles/:id', action: 'formHerptiles:view' },

        { path: '/mammals', action: 'formMammals:list' },
        { path: '/mammals.csv', action: 'formMammals:list' },
        { path: '/mammals.zip', action: 'formMammals:list' },
        { path: '/mammals/:id', action: 'formMammals:view' },

        { path: '/ciconia', action: 'formCiconia:list' },
        { path: '/ciconia.csv', action: 'formCiconia:list' },
        { path: '/ciconia.zip', action: 'formCiconia:list' },
        { path: '/ciconia/:id', action: 'formCiconia:view' }
      ],

      post: [
        { path: '/session', action: 'session:create' },
        { path: '/user', action: 'user:create' },
        { path: '/user/:id', action: 'user:edit' },
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

        { path: '/herp', action: 'formHerps:create' },
        { path: '/herp/:id', action: 'formHerps:edit' },

        { path: '/herptiles', action: 'formHerptiles:create' },
        { path: '/herptiles/:id', action: 'formHerptiles:edit' },

        { path: '/mammals', action: 'formMammals:create' },
        { path: '/mammals/:id', action: 'formMammals:edit' },

        { path: '/ciconia', action: 'formCiconia:create' },
        { path: '/ciconia/:id', action: 'formCiconia:edit' }
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
        { path: '/zone/:id/owner', action: 'zone:clearOwner' },
        { path: '/cbm/:id', action: 'formCBM:delete' },
        { path: '/visit/:year', action: 'visit:delete' },
        { path: '/birds/:id', action: 'formBirds:delete' },
        { path: '/herp/:id', action: 'formHerps:delete' },
        { path: '/herptiles/:id', action: 'formHerptiles:delete' },
        { path: '/mammals/:id', action: 'formMammals:delete' },
        { path: '/ciconia/:id', action: 'formCiconia:delete' }
      ]
    }
  }
}
