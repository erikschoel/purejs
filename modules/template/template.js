define(function() {
  return this.enqueue({

    name: 'modules.application',

    deps: {

      core: [ 'pure', 'dom' ],

      components: [ 'view', 'nav-bar', 'layout', 'accordion', 'grid', '$code-box' ]

    }

  }, function() {

    return {
      init: function(deps) {
        return deps('core.pure')(function(sys) {
          return function(app) {

            var comps  = sys.get('components');
            var module = comps.get('app');
            var navbr  = app.deps('components.nav-bar').create('navbar');
            var accor  = app.deps('components.accordion').create(app.accor.call(module));
            var items  = module.link().make('data.items.items', 'valueMap', app.items).add('items', {}, 'base');

            return [ navbr.pure(), accor.pure() ].lift(function(n, a) {

              n.item({ id: 'app', name: 'Home' });
              n.item({ id: 'find', name: 'Find' });
              n.menu({ id: 'options', name: 'Options' }).chain(function(opts) {
                opts.item({ id: 'animation', name: 'Animation' });
                opts.item({ id: 'effects',   name: 'Effects'   });
                n.item({ id: 'types', name: 'Types' });
                n.item({ id: 'play', glyph: 'glyphicon-play-circle', 'class': 'pull-right', href: 'Javascript:' });
                n.on('click', '[data-id="play"]', module.play.bind(module));
                n.item({ id: 'info', glyph: 'glyphicon-info-sign', 'class': 'pull-right', href: 'Javascript:' });
                n.on('click', '[data-id="info"]', module.info.bind(module));
                return opts.menu({ id: 'test', name: 'Test', submenu: true }).pure();
              }).run(function(test) {
                test.item({ id: 'test1', name: 'Test1' });
                test.item({ id: 'test2', name: 'Test2' });
              });

              a.control('main').run();
              module.observe(a, 'change', 'data.current.item', 'data.control.main.codeb');

              app.deps('components').nav   = n;
              app.deps('components').accor = a;

              return app;

            }).cont();
          }
        })(this);
      },
      ext: {
        initialize: function() {
          var app = this, el = this.view().$el().run();
          var lay = app.child('layout', app.deps('components.layout'));
          lay.grid(2, 3, function(elem, row, col) {
            if (col == 1) elem.classList.add('col-md-3', 'col-xs-4');
            else if (col) elem.classList.add('col-md-9', 'col-xs-8');
            return elem;
          }).bind(app.klass('Maybe').of).ap(app.$fn('append')).run(function(r) {
            var m = r.first();
            var c = m.chain(function(e) { return e.children.item(0); });
            app.deps('components.accor').attach(c);
          });
        },
        play: function() {
          sys.get('router').navigate('');
        },
        info: function() {
          var show;
          if ((show = sys.get('components.slideshow'))) {
            show.toggle();
          }else {
            sys.eff('sys.loader.component').run('components/slide-show/slide-show').bind(function(x) {

              return x.create({ name: 'slideshow' }).pure();

            }).run(function(mdl) {
              
              mdl.read = mdl.view().read().run('main', { title: 'PureJS Info', full: true });
              mdl.read.attach.run();
              mdl.create();
              mdl.createTest();
              mdl.toggle();
              return mdl;
            });
          }
        },
        test: function(comp) {
          return sys.eff('sys.loader.module').run('system', 'system').bind(function(mod) {
            var item = mod.component('test', 'system.test', comp || 'test');
            return item.pure ? item.pure() : item;
          }).bind(function(test) {
            return test.control('test');
          });
        }
      },
      control: {
        main: {

          codeb: function(evt) {
            var root = this.root();
            var hndl = root.removeEventListener(evt);
            return root.component('codeb', 'code-box').once(function(cb) {
              var module = cb.module();
              var accor  = module.get('accor');
              cb.attach(module.$el('#r0c2'));
              var handlr = module.handler('data.control.main.show');
              var obsrvr = module.observe(accor, 'change', 'data.current.item', handlr);
              handlr(evt);
            }, true);
          },
          show: function(evt) {
            this.root().get('codeb').show(evt);
          }
        }
      },
      items: {
        load: {
          base: function(info, key) {
            var node = sys.find(info.id);
            return key ? [ { name: key, key: key } ]
            : node.bind(function(v, k, i, o) {
              return { name: k, key: k };
            });
          },
          utils: function(info, key) {
            var node = sys.find(info.id);
            return key ? [ { name: key, key: key } ]
            : node.bind(function(v, k, i, o) {
              return { name: k, key: k };
            }).select(function(x) {
              return x.key != 'point';
            });
          },
          effects: function(info) {
            var node = sys.find(info.id);
            return node.map(function(tval, tkey) {
              return tval.get('factory').map(function(f, k) {
                return tval.get(k).map(function(v, t) {
                  return { key: [ tkey, k, t ].join('.') };
                });
              });
            }).flatten();
          },
          types: function() {
            var node = sys.get('types');
            return node.get('index').map(function(id) {
              return sys.find(id);
            }).bind(function(type) {
              var parent = type.parent();
              return { id: parent.uid(), key: type.get('type.$code'), path: parent.identifier() };
            }).chain(function(result) {
              return result.sort(function(a, b) {
                return a.key < b.key ? -1 : (a.key > b.key ? 1 : 0);
              });
            });
          },
          instance: function(info, key) {
            if (key) {
              var node;
              if (info.value && info.value.isStore) {
                node = info.value;
                return [ { id: node.parent().uid(), name: node.get('name'), path: node.identifier(), key: key } ];
              }else if ((node = sys.find(info.uid))) {
                return [ { id: node.parent().uid(), name: info.value, path: info.ref, key: node.cid() } ];
              }
            }else {
              var node = sys.get('instance');
              return node.reduce(function(r, v, k) {
                if (v.isStore && v.has('inst')) {
                  v.get('inst').map(function(v, k, n, o) {
                    if (k != 'current') r.push({ id: o.uid(), name: v.get('name'), path: v.identifier(), key: k });
                  });
                }
                return r;
              }, []);
            }
          },
          map: function(cid) {
            return this[cid || 'base'] || this['base'];
          },
          run: function(type, info, key) {
            return this.map(type).call(this, info, key);
          }
        },
        find: {
          base: function(path) {
            return sys.get(path) || sys.find(path);
          },
          effects: function(path) {
            return sys.eff(path.parts(1));
          },
          map: function(cid) {
            return this[cid || 'base'] || this['base'];
          },
          run: function(ref) {
            var uid  = ref.first();
            var base = sys.find(uid);
            return this.map(base.cid()).call(this, ref);
          }
        },
        show: {
          base: function(ref) {
            return this.parentt('find').run(ref);
          },
          types: function(ref) {
            var item = this.base(ref);
            return item.get('type.fn.proto');
          },
          effects: function(ref) {
            return sys.find(ref);
          },
          map: function(cid) {
            return this[cid || 'base'] || this['base'];
          },
          run: function(ref) {
            var uid  = ref.first();
            var base = sys.find(uid);
            return this.map(base.cid()).call(this, ref);
          }
        }
      },
      accor: function() {
        return {
          parent: this,
          name: 'accor',
          control: {
            main: {
              items: {
                base: function(type, info, key) {
                  return sys.link('items', 'load').prop('run', type, info, key);
                }
              },
              run: function() {
                return this.root().get('data').parse({
                  main: [
                    { path: 'utils',   name: 'Utils' },

                    { path: 'effects', name: 'Effects' },

                    { path: 'types',   name: 'Types' },

                    { path: 'async',   name: 'Async' }
                  ]
                }, 1);
              }
            }
          }
        };
      }
    };

  });
});
