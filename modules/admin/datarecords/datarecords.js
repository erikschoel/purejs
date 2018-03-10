define(function() {

  return this.enqueue({

    name: 'modules.admin.datarecords',

    deps: {

      core: [ 'pure', 'dom' ],

      components: [

        'view', 'layout'

      ]

    }

  }, function() {

    return {
      ext: {
        main: function() {
          console.log(this.identifier());
          var admin  = this.parent();
          var scope  = this.cid();
          var module = admin.get(scope);
          var dbid   = sys.get('config.modules.admin.modules').get(scope, 'dbid');
          var data   = sys.get('api.db.load.schema').execute({ query: dbid });

          return data.bind(function(d) {
            var data = sys.get('model').instance(d.madi, 'schema.$app');
            var node = data.record(d.madi);
            node.parse(d, true);

            return data.related('sys.type.module').chain(function(data) {
              return [
                data.related('sys.type.component').get('0.attr.path').chain(function(component) {
                  return sys.eff('sys.loader.component').run([ 'components', component, component ].join('/')).bind(function(c) {
                    return c.create({ name: 'nav', parent: module }).pure();
                  }).cont();
                }),
                data
              ].lift(function(c, d) {
                return d.related('sys.type.endpoint').get('0').chain(function(e) {
                  var query = 'marr_' + d.related('sys.type.any').get('0.marr').unit();
                  return sys.get('api.db').get(e.get('attr.path')).execute({ query: query }, c);
                });
              }).collect();
            });

          }).bind(function(loader) {

            module.get('nav').proxy('change', 'item', 'current', true);
            module.proxy('change', 'current', 'current', true);
            module.set('loader', loader.shift().bind(unit)).run(function(result) {
              console.log(result);
            });
            return module;

          });
        },
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
            app.lookup('nav').chain(function(nav) {
              nav.attach(c);
              nav.toggle();
              return nav;
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
