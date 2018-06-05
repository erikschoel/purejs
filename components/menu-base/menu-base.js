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
          return this.get('model') || this.set('model', this.prop('make').run(this));
        },
        record: function(record) {
          return this._record.lookup(record.nid()).orElse(function() {
            return this._record.set(record.nid(), record.source().run(this.parent()) && this.render().sequence(record.append()));
          }, this).unit();
        },
        render: function() {
          return this.get('render') || this.set('render', this.prop('main').run(this));
        },
        load: function(record) {
          return record.read().orElse(record).prop('toJSON', true).chain((data) => {
            return this.menu(data.dbid, this.prop('transf').run(data).values(true).unit());
          });
        },
        loadRecord: function(record, opts, values) {
          return this.menu(record.get('dbid'), values, opts);
        }
      },
      prop: {
        main: function() {
          return (this._render || (this._render = this.klass('IO').lift(function(comp, data) {
            return this.fx(function(record) {
              return comp.loadRecord(record, { opts: { close: false } }).bind(function(o) {
                if (data && data.format === 'named' && data.nodes && data.nodes.length) {
                  return data.nodes.map((name) => data[name].length ? data[name].ap(o.record(record)).collect() : []);
                }else if (data && data.nodes && data.nodes.length) {
                  return data.nodes.ap(o.record(record)).collect();
                }else {
                  return o;
                }
              }).cont();
            });
          })));
        },
        init: function(render, control) {
          return this.klass('IO').lift(function(parent, result) {
            var data = result.dbid ? result : result[result.keys().shift()];
            var record = control.create(data.marl || data.madi, data, parent);
            return render.run(record.client(parent)).run(data).run(record);
          });
        },
        make: function() {
          return this.init(this.main(), sys.get('schema.$app').control('main'));
        },
        transf: function() {
          return sys.get('schema.$app.transformers.menus').run();
        }
      }
    };

  });

});
