exports.default = {
  routes: function(api){
    return {

      get: [
        { path: '/user', action: 'user:list' },
        { path: '/user/:id',     action: 'user:view' },
        { path: '/zone', action: 'zone:list' },
        { path: "/zone/:id([0-9A-Z]+)", action: 'zone:view' },
        { path: '/locations/', action: 'location:list' },
        { path: '/locations/:id', action: 'location:get' },
        { path: '/locations/:id/zones', action: 'location:listZones' },
        { path: '/locations/:id/zones/:filter', action: 'location:listZones' },
        { path: '/area/:area/zones', action: 'area:listZones' },
        { path: '/area/:area/zones/:filter', action: 'area:listZones' },

        { path: '/docs',     action: 'showDocumentation' },
        { path: '/status',   action: 'status' },

        { path: '/nomenclature', action: 'nomenclature:types' },
        { path: '/nomenclature/:type', action: 'nomenclature:typeList' },
        { path: '/nomenclature/:type/bg/:value', action: 'nomenclature:bg:view' },
        { path: '/nomenclature/:type/en/:value', action: 'nomenclature:en:view' },

        { path: '/species', action: 'species:types' },
        { path: '/species/:type', action: 'species:typeList' },
        { path: '/species/:type/:value', action: 'species:view' },

        { path: '/cbm', action: 'formCBM:list' },
        { path: '/cbm.csv', action: 'formCBM:list' },
        { path: '/cbm/:id', action: 'formCBM:view' },

        { path: '/birds', action: 'formBirds:list' },
        { path: '/birds/:id', action: 'formBirds:view'}
      ],

      post: [
        { path: '/session',  action: 'session:create' },
        { path: '/user',     action: 'user:create' },
        { path: '/user/:id', action: 'user:edit' },
        { path: '/session/:email/resetpw', action: 'user:lost' },
        { path: '/session/:email/resetpw2', action: 'user:reset' },
        { path: '/zone/:id/owner', action: 'zone:requestOwnership' },
        { path: '/zone/:id/owner/response', action: 'zone:respondOwnershipRequest' },
        { path: '/cbm',      action: 'formCBM:create' },
        { path: '/cbm/:id',  action: 'formCBM:edit' },
        { path: '/birds',    action: 'formBirds:create'},
        { path: '/birds/:id',action: 'formBirds:edit'}
      ],

      put: [
        { path: '/session',  action: 'session:check' },
        { path: '/zone/:id/owner', action: 'zone:setOwner' },
      ],

      patch: [
        { path: '/user/:id', action: 'user:changepw'},
      ],

      delete: [
        { path: '/session',  action: 'session:destroy' },
        { path: '/zone/:id/owner', action: 'zone:clearOwner' },
        { path: '/cbm/:id', action: 'formCBM:delete' },
      ],
    }
  }
}
