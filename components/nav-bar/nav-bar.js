define(function() {

  return this.enqueue({

    name: 'nav-bar',

    deps: {

      parent: 'menu-base',

      components: [ 'view', 'dropdown' ],

      templates: [ 'tmpl' ]
    }

  }, function() {

    return {
      ext: {
        main: function() {
          return this.deps('components.dropdown').create({
            name: 'dd', parent: this, node: this.get('data.main'), opts: { close: false }
          }).kont().bind(this.wrap(
            this.view().item(this.view().$el()),
            this.$fn('append').ap(this.view().tmpl('main')).run({}),
            this.view().tmpl('wrap'),
            this.$fn('append').ap(this.view().tmpl('toggle')).run({})
          )).cont();
        },
        wrap: function(nav, elem, attrs) {
          return function(dd) { 
            dd.$fn('attrs').run(attrs);
            dd.$fn('attach').run(elem.unit());
            if (!dd.parent().state('attach')) {
              dd.parent().attach(document.body);
            }
            return dd.parent();
          };
        },
        item: function(key, values) {
          return this.get('dd').item(key, values);
        },
        menu: function(key, values, opts) {
          return this.lookup('dd').chain(function(dd) {
            return dd.menu(key, values, opts);
          });
        },
        toggle: function(toggle) {
          return this.control('main').toggle().run(toggle);
        },
        current: function() {
          return this.lookup('dd').map(function(dd) {
            return dd.$state('current').prop('split', '.').unit();
          }).map(function(current) {
            return sys.$find(current.shift().replace(/[^0-9]/g, '')).get(current.pop());
          });
        },
        create: function(values) {
          return this.current().get('data.record').chain(function(record) {
            return record.run(values || {})(unit);
          });
        }
      },
      control: {
        main: {
          toggle: function() {
            var root = this.root();
            return (this._toggle || (this._toggle = root.view().eff('toggle').run('in').ap(root.$fn('find').ap('.navbar-collapse'))));
          }
        }
      },
      tmpl: {

        tag: 'nav',

        attr: function() {

          return { 'class' : 'navbar navbar-inverse' };
        },

        wrap: function() {

          return { 'class' : 'nav navbar-nav toggle' };
        }
      },
      events: {
        dom: {
          'click:.navbar-toggle': 'toggle'
        }
      }
    };

  });

});