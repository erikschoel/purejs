define(function() {

  return this.enqueue({

    name: 'popup-menu',

    deps: {

      components: [ 'view', 'dropdown' ],

      templates: [ 'tmpl' ]
    }

  }, function() {

    return {
      ext: {
        main: function() {
          this.deps('components.dropdown').create({
            name: 'dd', parent: this
          }).run(this.wrap(
            this.view().item(this.view().$el()),
            this.$fn('append').ap(this.view().tmpl('main')).run({}),
            this.view().tmpl('wrap'),
            this.$fn('append').ap(this.view().tmpl('toggle')).run({})
          ));
        },
        wrap: function(nav, elem, attrs) {
          return function(dd) {
            dd.$fn('attrs').run(attrs);
            dd.$fn('attach').run(elem.unit());
            return nav;
          };
        },
        item: function(values) {
          return this.get('dd').item(values);
        },
        menu: function(values) {
          return this.get('dd').menu(values);
        },
        toggle: function(toggle) {
          return this.control('main').toggle().run(toggle);
        }
      },
      control: {
        main: {
          toggle: function() {
            var root = this.root();
            return (this._toggle || (this._toggle = root.view().eff('toggle').run('open').ap(root.$fn('find').ap('.popup.dropdown'))));
          }
        }
      },
      tmpl: {

        tag: 'div',

        attr: function() {

          return { 'class' : 'dropdown' };
        },

        wrap: function() {

          return { 'class' : 'dropdown-menu' };
        }
      },
      events: {
        dom: {
          'click:.dropdown-toggle': 'toggle'
        }
      }
    };

  });

});