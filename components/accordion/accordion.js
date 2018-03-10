define(function() {

  return this.enqueue({

    name: 'accordion',

    deps: {

      core: [ 'dom' ],

      components: [ 'view' ],

      templates: [ 'tmpl' ]
    }

  }, function() {

    return {
      ext: {
        initialize: function() {
          var style = this.view().style();
          var attrs = style.run().run([ 'height', 'width' ]).lift(function(s, a) {
            return { height: a.height - s.height + 2, width: a.width - s.width };
          }).ap(style.run('.row').run([ 'height', 'width' ])).lift(function(attrs, rule) {
            rule.style.maxHeight = attrs.height + 'px';
            return rule;
          }).ap(this.view().rules('#' + this.nid() + ' .panel-body').first());
        },
        panel: function(evt) {
          return this.get('data.control.main').init(evt);
        },
        toggle: function(name, continuation) {
          var current = this.state('current-panel');
          var control = this.control('main');
          if (current && name == current) {
            this.state('current-panel', this.state('previous-panel', this.state('next-panel', '')));
          }else if (current) {
            control.$toggle(this.state('previous-panel', current));
            this.state('next-panel', name);
          }else {
            this.state('next-panel', name);
          }
          return control.$toggle(name, continuation);
        },
        item: function(main, name) {
          if (!main) {
            return this.get('data.current.item');
          }else if (main == 'none') {
            return this.set('data.current.item', '');
          }else {
            return this.set('data.current.item', this.lookup('data.main.' + main).map(function(info) {
              return info.id + '.' + name;
            }).orElse('').unit());
          }
        },
        none: function() {
          return this.item('none');
        }
      },
      control: {
        main: {
          $toggle: function(name, continuation) {
            var root = this.root();
            return root.lookup('data.main.' + name + '.$find').map(function(io) {
              return io.runMaybe('.panel-heading');
            }).lift(function(elem, accor) {
              accor.state('current-panel', accor.state('next-panel'));
              accor.state('next-panel', '');
              return accor.get('data.control.main').toggle(elem.nextElementSibling);
            }).ap(root).chain(function(load) {
              return load.run(continuation || unit);
            });
          },
          anim: function() {
            return (this._anim || (this._anim = sys.eff('dom.elements.animate').bind(function(a) {
              return a.fx(a.run({ duration: 150, easing: 'swing', toggle: true, klass: true, prop: 'max-height', fn: 'px', from: 0, to: 'max-height', value: 'from' })).map(a.constructor.$pure);
            })));
          },
          init: function(evt) {
            if (evt.action == 'create') {
              var root = this.root();
              var view = root.view();
              var node = sys.get(evt.value.path);
              if (node) evt.value.id = node.uid();
              evt.value.$el    = root.$fn('append').run(view.tmpl('main', { 'class' : 'panel panel-default' }).run(evt.value));
              evt.value.$find  = view.eff('find').run(evt.value.$el).toIO();
              evt.value.$add   = view.tmpl('item').map(view.eff('append').runIO(evt.value.$find.run('tbody')));
              evt.value.$patch = view.tmpl('item').map();
              evt.value.$empty = view.eff('empty').ap(evt.value.$find.run('tbody'));
              var data = root.get(evt.ref.split('.').slice(root.level()-evt.level));
              data.emit('change', evt.target, 'update', evt.value);
            }
          },
          panel: function(name) {
            return this.root().get('data.main', name);
          },
          load: function(name) {
            var info = this.panel(name);
            if (!info.done && (info.done = true)) {
              return this.data(name).call(this, name, info).ap(info.$add);
            }
            return this.root();
          },
          data: function(name) {
            return this.items.get(name)||this.items.get('base')||unit;
          },
          action: function(action, ref, target, evt) {
            var name = ref.split('.').at(1);
            var info = this.panel(name);
            var root = this.root();
            if (!info.done) {
              // Pane not loaded - no need to refresh anything //
            }else if (action == 'remove') {
              var id = info.$find.toMaybe().run('[data-key="'+target+'"]').chain(function(elem) {
                return elem.parentElement.removeChild(elem).getAttribute('data-id');
              });
              if (id && id.concat('.', target) == root.item()) {
                root.none();
              }
              return root;
            }else if (action == 'create') {
              return info.$find.run('[data-path="'.concat(ref, '"]'))
              || this.data(name).call(this, evt, target).ap(info.$add).run(this.bin(function(main, item) {
                return item.chain(function(tr) {
                  return main.item(tr);
                });
              }));
            }else if (action == 'update') {
              return info.$find.ap('[data-path="'.concat(ref, '"]')).lift(function(tr, rndr) {
                return rndr.run(function($$tr) {
                  return $$tr.chain(function($tr) {
                    tr.removeChild(tr.firstElementChild);
                    tr.appendChild($tr.firstElementChild);
                  });
                });
              }).run(this.data(name).call(this, evt, target).ap(this.root('view').tmpl('item')));
            }
          },
          change: function(evt) {
            return this.action(evt.action, evt.ref, evt.target, evt);
          },
          toggle: function(elem) {
            var info = this.panel(elem.getAttribute('data-path'));
            var anim = info.$anim || (info.$anim = this.anim().run({ elem: info.$find.run('.panel-body') }));
            if (elem.classList.contains('collapse')) {
              return this.load(elem.getAttribute('data-path')).chain(function(x) {
                anim.run();
                elem.classList.remove('collapse');
                return x;
              });
            }else {
              anim.run(function() {
                elem.classList.add('collapse');
              });
            }
            return this.root();
          },
          item: function(trg) {
            var key = trg.getAttribute('data-key');
            var res = trg.closest("[data-path]");
            var uid = res.getAttribute('id') || res.getAttribute('data-id');
            if (uid) {
              res = sys.find(uid);
              if (res && key) this.root().set('data.current.item', res.uid() + '.' + key);
            }else if (key) {
              res = res.getAttribute('data-path');
              this.root().set('data.current.item', res ? (res + '.' + key) : key);
            }
          },
          show: function(evt) {
            this.item(evt.currentTarget);
          },
          click: function(evt) {
            var trg = evt.currentTarget.nextElementSibling;
            if (trg) this.root().toggle(trg.getAttribute('data-path'));
          }
        }
      },
      tmpl: {
        attr: function() {

          return { 'class' : 'accordion panel-group' };
        },
        item: function() {
          var view = this;
          var item = view.get('item');
          if (!item) {
            item = view.set('item', view.eff('tr').ap(view.render('item')));
          }
          return item;
        }
      },
      events: {
        data: {
          'change:data.main.%': 'panel'
        },
        dom: {
          'click:.panel-heading': 'data.control.main.click',
          'click:.panel-body tr': 'data.control.main.show',
          'click:[data-click]': 'view.$fn.click'
        }
      }
    };

  });

});