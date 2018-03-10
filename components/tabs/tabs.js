define(function() {

  return this.enqueue({

    name: 'tabs',

    deps: {

      templates: [ 'tmpl' ],

      components: [ 'dropdown', 'view' ]

    }

  }, function() {

    return {
      ext: {
        main: function() {
          var view = this.view();
          view.parent('$fn.render').run('main').run({ 'class': 'nav nav-tabs' });
          view.parent('$fn.append').ap(view.eff('div').toMaybe()).run({ 'class': 'tab-content' });
        },
        item: function(values) {
          var tabs = this;
          var data = this.get('data.main.tabs');
          var cont = this.klass('Cont').of(function $_pure(k) {
            tabs.observe('change', 'data.main.tabs.' + values.id, k);
          });
          data.set(values.id, values);
          return cont;
        },
        tab: function(id) {
          if (id) {
            return this.control('main').toggle(this.pane(id).$tab);
          }else {
            return this.state('current');
          }
        },
        pane: function(id) {
          return this.get('data.main.tabs', id || this.state('current'));
        }
      },
      control: {
        main: {
          init: function(evt) {
            if (evt.action == 'create') {
              var root = this.root();
              var view = root.view();
              evt.value.$tab  = view.tmpl('item').map(view.eff('append').runIO(root.$fn('find').run('ul'))).run(evt.value);
              evt.value.$pane = view.tmpl('pane').map(view.eff('append').runIO(root.$fn('find').run('.tab-content'))).run(evt.value);
              evt.value.$find = view.eff('find').run(evt.value.$pane).toIO().toMaybe();
              var data = root.get(evt.ref.split('.').slice(root.level()-evt.level));
              data.emit('change', evt.target, 'init', evt.value);
            }
          },
          tabs: function() {
            return (this._tabs || (this._tabs = this.root('view').elms(function(elem) {
              if (elem.classList.contains('active'))
                elem.classList.remove('active');              
              return elem;
            }, 'div')('li,div.tab-pane'))).run();
          },
          panes: function() {
            return (this._panes || (this._panes = this.root().view().eff('toggle').run('active')));
          },
          toggle: function(elem) {
            var root = this.root(), panes = this.panes();
            return this.tabs().chain(panes.ap(panes.klass('maybe').of(elem).unit()).wrapIO()).run(function(trg) {
              return trg.chain(function(el) {
                return root.state('current', panes.ap(root.pane(el.getAttribute('data-id')).$pane).chain(function(el) {
                  return el.id;
                }));
              });
            });
          },
          click: function(evt) {
            return this.toggle(evt.currentTarget);
          }
        }
      },
      tmpl: {

        attr: function() {

          return { 'class' : 'tabs panel' };//, 'data-bind-path' : 'data.main.data.%current'
        }
      },
      data: {
        main: {
          tabs: {},
          data: {}
        }
      },
      events: {
        data: {
          //'change:data.main.data.%': 'binding',
          'change:data.main.tabs.%': 'data.control.main.init'
        },
        dom: {
          //'change:[data-bind-path]': 'binding',
          'click:ul.nav-tabs li': 'data.control.main.click'
        }
      }
    };

  });

});