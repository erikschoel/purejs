define(function() {

  return this.enqueue({

    name: 'modules.admin-base',

    deps: {

      core: [ 'pure' ],

      components: [ 'view', 'modules/admin/edit' ]

    }

  }, function() {

    return {
      init: function(deps) {
        return deps('core.pure')(function(sys) {
          return function(app) {
            app.ext.$io = app.io.call({ IO: sys.klass('io') });
            return app;
          }
        })(this);
      },
      io: function() {
        return {
          comp: this.IO.lift(function(data, comp) {
            return comp.control('admin').make(data).lift(comp.control('admin').load(data));
          }),
          create: this.IO.lift(function(opts, comp) {
            return comp.create(opts).pure();
          }),
          loader: sys.eff('sys.loader.component').run('modules/admin/components/edit/edit'),
          query: this.IO.pure(function(item) {
            var code = item.value.split('_');
            if (code.first() === 'create') {
              return [ code.slice(0, 2).join('_'), '/madi_', code.pop() ].join('');
            }else {
              return code.length > 2 ? (code.last() === '0' ? [ 'create', code[1] ] : [ 'mare', code.pop() ]).join('_') : item.value;
            }
          }),
          data: sys.get('model').$api('db.load.schema'),
          tree: sys.get('api').get('db.tree'),
          load: function(opts, data) {
            return this.loader.lift(this.create.run(opts)).lift(this.comp.run(data));
          },
          make: this.IO.lift(function(root, data) {
            var name = data.marl || data.madi, comp;
            if (name && !data.lvl) {
              if (!(comp = root.get(name))) {
                return root.$io.load({ name: name, parent: root }, data);
              }else {
                return comp.control('admin').load(data).run(comp).cont();
              }
            }else {
              return root.cont();
            }
          }),
          $data: function() {
            return (this._data || (this._data = this.data.ap(this.query)));
          },
          $lift: function(make) {
            return this.lift(function(comp, io) {
              return io.run(make).run(comp);
            });
          },
          run: function(ctx, item) {
            return this.$data().run(item).lift(this.$lift.call(ctx, this.make)).bind(function(result) {
              return result instanceof Array ? result.flatten() : result;
            }).run(function(comp) {
              if (comp && comp.toggle) comp.toggle();
              else if (comp instanceof Array) {
                var inst = comp.flat().first();
                if (inst && inst.toggle) inst.toggle();
              }
            });
          }
        };
      },
      ext: {
        initialize: function() {
          this.view();
        },
        mounted: function() {
          this.control('main').make();
        },
        current: function() {
          return this.maybe().lift(function(comp, current) {
            return comp.get(current);
          }).ap(this.lookup('data.current.modal'));
        },
        load: function(record) {
          
        }
      },
      control: {
        main: {
          make: function() {
            return this.load({ value: sys.get('router').getRoutePart('last') });
          },
          load: function(item) {
            return this.root().$io.run(this.root(), item);
          }
        }
      }

    };

  });
});
