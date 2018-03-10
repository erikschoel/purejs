define(function() {

  return this.enqueue({

    name: 'modules.admin.datamodel',

    deps: {

      core: [ 'pure', 'dom' ],

      components: [

        'view', 'layout', 'accordion'

      ]

    }

  }, function() {

    return {
      init: function(deps) {
        return deps('core.pure')(function(sys) {
          return function(app) {

            var module = sys.get('components.admin.datamodel');
            var accor  = app.deps('components.accordion').create(app.accor.call(module));

            return [ accor.pure() ].lift(function(a) {

              a.control('main').run();
              app.deps('components').accor = a;

              a.proxy('change', 'item', 'current', true);
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
            app.deps('components.accor').attach(c);
          });
        }
      },
      accor: function() {
        return {
          parent: this,
          name: 'accor',
          control: {
            main: {
              items: {
                data: function(query) {
                  return sys.get('api.db.model').request().run({ query: query }).bind(function(result) {
                    return result.map(function(v) {
                      return { name: v.madi_code, key: 'madi_' + v.madi_id };
                    });
                  });
                },
                base: function(type, info, key) {
                  return this.items.data(info.key);
                }
              },
              add: function(evt) {
                this.root().set('data.current.item', 'attributes.madi_1');
              },
              run: function() {
                return this.root().get('data').parse({
                  main: [
                    { key: 'attributes', path: 'attributes', name: 'Attributes', add: true },
                    { key: 'types', path: 'types', name: 'Types' },
                    { key: 'relations', path: 'relations', name: 'Relations' },
                    { key: 'menus', path: 'menus', name: 'Menus' },
                    { key: 'selector', path: 'selector', name: 'Selector' }
                  ]
                }, 1);
              }
            }
          }
        };
      },
      data: {
        params: {
          attach: {
            any: '#r0c2',
            accor: '#r0c1'
          }
        }
      }
    };

  });
});
