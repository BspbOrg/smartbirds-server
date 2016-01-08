exports.default = {
  routes: function(api){
    return {

      get: [
        { path: '/user', action: 'user:list' },
        { path: '/user/:id',     action: 'user:view' },
        { path: '/zone', action: 'zone:list' },
        { path: '/zone/:id', action: 'zone:view' },
        { path: '/locations/', action: 'location:list' },
        { path: '/locations/:id', action: 'location:get' },
        { path: '/locations/:id/zones', action: 'location:listZones' },
        { path: '/locations/:id/zones/:filter', action: 'location:listZones' },

        { path: '/docs',     action: 'showDocumentation' },
        { path: '/status',   action: 'status' },

        { path: '/nomenclature/:type', action: 'nomenclature:typeList' },
        { path: '/nomenclature/:type/:slug', action: 'nomenclature:view' },

        { path: '/cbm/:id', action: 'formCBM:view' }
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
      ],

      put: [
        { path: '/session',  action: 'session:check' },
        { path: '/zone/:id/owner', action: 'zone:setOwner' },
      ],

      delete: [
        { path: '/session',  action: 'session:destroy' },
        { path: '/zone/:id/owner', action: 'zone:clearOwner' },
      ],
    }
  }
}
