exports.default = {
  routes: function(api){
    return {

      get: [
        { path: '/user', action: 'user:list' },
        { path: '/user/:id',     action: 'user:view' },
        { path: '/zone', action: 'zone:list' },
        { path: '/zone/:id', action: 'zone:view' },
        { path: '/locations/', action: 'location:list' },
        { path: '/locations/:id/zones', action: 'location:listZones' },
        { path: '/locations/:id/zones/:filter', action: 'location:listZones' },

        { path: '/docs',     action: 'showDocumentation' },
        { path: '/status',   action: 'status' },
      ],

      post: [
        { path: '/session',  action: 'session:create' },
        { path: '/user',     action: 'user:create' },
        { path: '/user/:id', action: 'user:edit' },
        { path: '/session/:email/resetpw', action: 'user:lost' },
        { path: '/session/:email/resetpw2', action: 'user:reset' }
      ],

      put: [
        { path: '/session',  action: 'session:check' },
      ],

      delete: [
        { path: '/session',  action: 'session:destroy' },
      ],
    }
  }
}
