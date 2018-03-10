define(function() {

  return this.enqueue({

    name: 'nav-sidebar',

    deps: {

      parent: 'nav-bar',

      templates: [ 'tmpl' ]
    }

  }, function() {

    return {
      ext: {
        wrap: function(nav, elem, attrs) {
          return function(dd) {
            dd.$fn('attrs').run(attrs);
            dd.$fn('attach').run(elem.unit());
            dd.parent().attach();
            return nav;
          };
        },
        toggle: function() {
          this.$el().map(function(elem) {
            if (elem.classList.contains('open')) {
              elem.classList.remove('open');
            }else {
              elem.classList.add('open');
            }
          }).run();
        }
      },
      control: {
        main: {
          item: function(trg) {
            var key = trg.getAttribute('data-key');
            var res = trg.closest("[data-path]");
            var uid = res ? (res.getAttribute('id') || res.getAttribute('data-id')) : false;
            if (uid) {
              res = sys.find(uid);
              if (res && key) this.root().set('data.current.item', res.uid() + '.' + key);
            }else if (key) {
              this.root().set('data.current.item', res ? (res.getAttribute('data-path') + '.' + key) : key);
            }
          },
          show: function(evt) {
            var scope = this.root().parent().get('router').scope();
            var route = evt.target.getAttribute('')
            this.item(evt.currentTarget);
          }
        }
      },
      tmpl: {

        tag: 'div',

        attr: function() {

          return { 'class' : 'sidebar-wrapper' };
        },

        wrap: function() {

          return { 'class' : 'sidebar-nav'}
        }

      },
      events: {
        data: {
          'change:data.main.%': 'xxx'
        },
        dom: {
          'click:.sidebar-wrapper li': 'data.control.main.show'
        }
      }
    };

  });

});