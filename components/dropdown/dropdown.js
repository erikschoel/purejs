define(function() {

  return this.enqueue({

    name: 'dropdown',

    deps: {

      parent: 'menu-base',

      templates: [ 'tmpl' ],

      components: [ 'view' ]

    }

  }, function() {

    return {
      ext: {
        item: function(key, values) {
          return this.get('data.main.item').replace(key, values || {});
        },
        menu: function(key, values, opts) {
          var menu = this.get(key);
          if (!menu) {
            menu = this.constructor.create(({
              name: key, parent: this
            }).clone(opts || {}));
            return menu.run(this.bin(function(parent, dd) {
              dd.get('data.main.menu').child(key).parse(values || {});
              dd.$fn('attrs').run({ 'class': 'dropdown-menu' });
              return dd;
            })).cont();
          }else {
            menu.get('data.main.menu').replace(key, values || {});
            return menu.cont();
          }
        }
      },
      control: {
        data: {
          change: function(evt) {
            if (evt.action === 'create' && typeof evt.value === 'object' && evt.value.isStore) {
              if (evt.value.length()) {
                var type = evt.value.parent().cid();
                var root = this.root();
                if (type === 'item') {
                  return root.$fn('render').run(type).run(evt.value.values(true));
                }else if (type === 'menu') {
                  root.$fn('empty').run();
                  return root.$fn('attach').ap(root.parent('$fn.render').run('dropdown').run(evt.value.values(true)));
                }
              }
            }else if (evt.action === 'update') {
              var root = this.root();
              var node = sys.find(evt);
              var type = node.parent().cid();
              if (type === 'item' || type === 'menu') {
                root.parent().$el('[data-key="' + node.cid() + '"]').lift(function(elem, make) {
                  if (type === 'menu') {
                    var replace = elem.firstElementChild;
                    elem.insertBefore(make.firstElementChild, replace);
                    elem.removeChild(replace);
                  }else {
                    elem.innerHTML = make.innerHTML;
                  }
                }).run(root.view().eff('render').to('io').run('div').run(root.view().render(type === 'item' ? 'item' : 'dropdown').run(node.values(true))));
              }
            }
          }
        },
        state: {
          change: function(evt) {
            var root = this.root(), part;
            if (evt.previous) {
              part = evt.previous.split('.');
              root.$fn('query').run('[data-key="'+part.pop()+'"]').map(function(el) {
                el.classList.remove('active');
              });
            }
            part = evt.value.split('.');
            root.$el('[data-nid="'+part.shift()+'"][data-key="'+part.pop()+'"]').chain(function(el) {
              el.classList.add('active');
            });
          }
        },
        main: {
          io: function() {
            return (this._toggle || (this._toggle = this.root().$el().lift(function(elem, toggle) {
              return this.fx(function(trg) {
                if (elem.id == trg.closest('ul').id) {
                  toggle.raf(trg);
                }
              });
            }).run(this.root('view.fn.eff.toggle').run('open'))));
          },
          toggle: function(trg) {
            if (trg.classList.contains('dropdown')) {
              var curr = this.root().closest('dd').state('current');
              var next = this.current(trg);
              if (!curr || curr === next || !trg.classList.contains('open')) {
                this.io().run(trg);
              }
            }
          },
          current: function(trg) {
            if (trg.closest('ul').id === this.root().nid()) {
              return this.root().closest('dd').state('current', this.root().nid() + '.' + trg.getAttribute('data-key'));
            }
          },
          click: function(evt) {
            var trg = evt.target;
            if (trg.classList.contains('dropdown-toggle')) {
              this.toggle(trg.closest('li'));
            }else if (this.root().opts('close') !== false) {
              var cls = trg.closest('.dropdown.open');
              if (cls) cls.classList.remove('open');
            }else if ((trg = trg.closest('li'))) {
              this.current(trg);
            }
          },
          enter: function(evt) {
            var trg = evt.currentTarget;
            if (trg && !trg.matches('.dropdown.open')) {
              this.toggle(trg);
            }
          },
          leave: function(evt) {
            if (evt.target && evt.currentTarget && !evt.currentTarget.matches('.open.dropdown-submenu')) {
              var tid = evt.target.closest('ul');
              var trg = evt.target.closest('li.dropdown.open');
              if (trg && (!evt.relatedTarget || evt.relatedTarget.localName != 'a'
                || evt.relatedTarget.closest('ul') != tid)) {
                this.io().run(trg);
              }
            }
          }
        }
      },
      tmpl: {

        tag: 'ul',

        attr: function() {

          return { 'class' : 'dropdown' };
        }

      },
      data: {
        main: {
          item: {},
          menu: {}
        }
      },
      events: {
        data: {
          'change:state.current': 'data.control.state.change',
          'change:data.main.%': 'data.control.data.change'
        },
        dom: {
          'click:li': 'data.control.main.click',
          //'mouseover:li.dropdown': 'data.control.main.enter',
          'mouseout:ul.toggle ul.dropdown-menu li': 'data.control.main.leave'
        }
      }
    };

  });

});