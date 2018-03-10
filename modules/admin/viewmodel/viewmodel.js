define(function() {

  return this.enqueue({

    name: 'modules.admin.viewmodel',

    deps: {

      core: [ 'pure', 'dom' ],

      components: [

        'view', 'layout', 'nav-sidebar'

      ]

    }

  }, function() {

    return {
      init: function(deps) {
        return deps('core.pure')(function(sys) {
          return function(app) {

            var module = sys.get('components.admin.viewmodel');
            var navbr  = app.deps('components.nav-sidebar').create('sidebar', module);
            //var data   = sys.get('api.db.type').execute({ query: [ 'sys.type.module', 'components' ] }, navbr);
            //var data   = sys.get('api.db.tree').execute({ query: '415' }, navbr);
            var data   = sys.get('api.db.menu').execute({ query: 'main' }, navbr);

            return [ data.cont(), navbr.pure() ].lift(function(d, n) {

              n.proxy('change', 'item', 'current', true);
              module.proxy('change', 'current', 'current', true);

              return app;

            }).cont();

          }
        })(this);
      },
      ext: {
        initialize: function() {
          var app = this, el = this.view().$el().run();
          var lay = app.child('layout', app.deps('components.layout'));
          lay.grid(2, 3, function(elem, row, col) {
            if (col == 1) elem.classList.add('col-md-4', 'col-xs-5');
            else if (col) elem.classList.add('col-md-8', 'col-xs-7');
            return elem;
          }).bind(app.klass('Maybe').of).ap(app.$fn('append')).run(function(r) {
            var m = r.first();
            var c = m.chain(function(e) { return e.children.item(0); });
            app.lookup('sidebar').chain(function(sidebar) {
              sidebar.attach(c);
              sidebar.toggle();
              return sidebar;
            });
          });
        }
      },
      data: {
        params: {
          attach: {
            any: '#r0c2',
            sidebar: '#r0c1',
            accor: '#r0c1'
          }
        }
      }
    };

  });
});
