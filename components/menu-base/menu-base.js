define(function() {

  return this.enqueue({

    name: 'menu-base',

    deps: {

      components: [ 'view' ]

    }

  }, function() {

    return {
      ext: {
        main: function() {
          this._record = this._data.node('record');
        },
        model: function() {
          return this.get('model') || this.set('model', this.control('render').make().run(this));
        },
        record: function(record) {
          return this._record.lookup(record.nid()).orElse(function() {
            return this._record.set(record.nid(), record.source().run(this.parent()) && this.render().sequence(record.append()));
          }, this).unit();
        },
        render: function() {
          return this.get('render') || this.set('render', this.control('render').main().run(this));
        },
        transf: function() {
          return this.get('transf') || this.set('transf', this.control('render').transf());
        },
        load: function(data) {
          return this.menu(data.dbid, this.transf().run(data).values(true).unit());
        }
      },
      control: {
        render: {
          main: function() {
            return (this._render || (this._render = this.klass('IO').lift(function(comp, data) {
              return this.fx(function(record) {
                return comp.menu(record.get('dbid'), {}, { opts: { close: false } }).bind(function(o) {
                  var rec = o.record(record);
                  if (data && data.format === 'named' && data.nodes && data.nodes.length) {
                    return data.nodes.map((name) => data[name].length ? data[name].ap(rec).collect() : []);
                  }else if (data && data.nodes && data.nodes.length) {
                    return data.nodes.ap(rec).collect();
                  }else {
                    return o;
                  }
                }).cont();
              });
            })));
          },
          init: function(render) {
            return this.klass('IO').lift(function(parent, result) {
              var data = result.dbid ? result : result[result.keys().shift()];
              var record = sys.get('schema.$app').control('main').create(data.marl || data.madi, data, parent);
              return render.run(record.client(parent)).run(data).run(record);
            });
          },
          make: function() {
            return this.init(this.main());
          },
          transf: function() {
            return (this._transf || (this._transf = sys.get('schema.$app.transformers.menus').run()));
          }
        }
      }
    };

  });

});
