define(function() {

  return this.enqueue({

    name: 'engine',

    deps: {

      core: [ 'pure' ]

    }

  }, function() {

    return {
      init: function(deps) {
        return deps('core.pure')(function(sys) {
          return function(def) {

            var init = def.rdr.call({
              klass: sys.klass('Reader'), $cache: sys.get().ensure('cache.view'), $eff: def.$eff
            }).of(def.reader.init);

            def.ext.reader = init.bind(def.reader.make);
            def.ext.$eff   = def.$eff;
            def.ext.doT    = def.doT(def.deps('scripts.doT'));
            return { ext: def.ext, deps: def.deps };
          }
        })(this);
      },
      deps: function(deps) {
        this.deps = deps;
        return this;
      },

      doT: function(doT) {
        return function(str, attr) {
          return doT.compile(str, attr);
        }
      },
      reader: {
        init: function(ctx) {
          return this.item(ctx);
        },
        ctx: function(init, make) {

        },
        make: function(x) {

        },
        run: function(ctx) {
          return this.init(ctx);
        }
      },
      rdr: function() {
        return this.klass.extend(function EffReader(f) {
          this.$super.call(this, f);
        }, {
          $eff: this.$eff,
          eff: function(name, value) {
            return value ? (this.$eff[name] = value) : (name ? this.$eff[name] : this.$eff);
          },
          $cache: this.$cache,
          cache: function(type, path, value) {
            return (this.$cache.get(type) || this.$cache.node(type)).acc(path, value);
          },
          item: function(view) {
            return {
              reader: this,
              konst: this.sys().fn.$const,
              eff: function(name, value) {
                return this.reader.eff(name, value);
              },
              el: view.el,
              view: view.view,
              cache: this.cache !== false && view.cache !== false ? function(key, value) {
                return (this[key] = this.konst(value))();
              } : function(key, value) {
                return value;
              },
              io: function() {
                return this.cache('io', this.reader.klass('IO').of(this));
              },
              lift: function() {
                return this.cache('lift', this.io().lift(function(ctx, fn) {
                  return this.fx(function(value) {
                    return fn(ctx, value);
                  });
                }));
              }
            };
          }
        });
      },
      $eff: sys.run(function() {
        return {
          elem: this.eff('dom.elements.create').init('maybe', 'IO')
        };
      }),
      ext: {




      }
    };

  });

});