define(function() {

  return this.enqueue({

    name: 'modules.find',

    deps: {

      core: [ 'pure' ],

      components: [ 'view', 'layout', 'grid', 'form', 'table' ]

    }

  }, function() {

    return {

      init: function(deps) {

        return deps('core.pure')(function(sys) {
          return function(app) {

            var module = sys.get('components.find');
            var table  = app.deps('components.table').create('table', module);
            var form   = app.deps('components.form').create('form', module);

            return [ table.pure(), form.pure() ].lift(function(t, f) {

              app.deps('components').table = t.control('main').render(app.table);
              app.deps('components').form  = f.fields(app.fields, 'data.main', true);

              return app;

            }).cont();
          }
        })(this);
      },

      ext: {
        main: function() {
          var a = this;
          var l = a.child('layout', a.deps('components.layout'));
          l.grid(2, 3, function(elem, row, col) {
            if (col == 1) elem.classList.add('col-md-4', 'col-xs-6');
            else if (col) elem.classList.add('col-md-8', 'col-xs-6');
            return elem;
          }).bind(a.klass('Maybe').of).ap(a.view().parent('$fn.append')).run(function(r) {
            var m = r.first();
            var f = a.deps('components.form');
            var t = a.deps('components.table');
            f.attach(m.map(function(e) { return e.children.item(0); }));
            t.attach(m.map(function(e) { return e.children.item(1); }));
            f.proxy('click', 'button', 'search.run');
            t.proxy('click', 'tr', 'table.click');
            a.observe('change', 'table.click', 'data.control.main.show');
          });
        },
        cast: function() {
          return this.get('cast') ||
            (this.set('cast', function(item) {
              if (item && item.object && item.object.isStore) {
                return {
                  $key: 'firstChild',
                  firstChild: { id: item.key, innerText: item.object.identifier() + '.' + item.key }
                }
              }else {
                return {
                  $key: 'firstChild',
                  firstChild: { id: item.key, innerText: !item.value ? '<no value>'
                    : (typeof item.value == 'object' ? (item.value.name || item.value._cid || 'Object')
                      : '<unknown value>') }
                };
              }
            })
          );
        }
      },
      control: {
        main: {
          search: function() {
            var comp  = this.root();
            var str   = comp.get('form.data.main.attr.str') || '';
            var tabl  = comp.deps('components.table');
            var store = sys.get().store();
            var rndr  = comp.get('rndr') || comp.set('rndr', tabl.view().tmpl('main', 'body', 'column'));

            return store.search(str, true).bind(comp.cast()).ap(rndr.run());
          },
          find: function() {
            this.search().run();
          },
          show: function(evt) {
            console.log(evt);
          }
        }
      },

      fields: {
        attr: {
          str: { type: 'string', elem: { tag: 'input',  label: 'Find', type: 'text',  placeholder: 'type your search here' } },
          run: { type: 'action', elem: { tag: 'button', label: 'Run',  type: 'button' } }
        }
      },

      table: {
        name:  { 'class': 'h2', 'innerText': 'Result'  }
      },

      events: {
        data: {
          'change:search.run':'data.control.main.find'
        }
      }

    };

  });

});
