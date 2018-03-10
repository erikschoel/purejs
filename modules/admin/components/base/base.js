define(function() {

  return this.enqueue({

    name: 'modules.admin.components.base',

    deps: {

      core: [ 'pure' ],

      components: [ 'view', 'form', 'tabs', 'modal' ]

    }

  }, function() {

    return {

      klass: function AdminBase(opts) {
        opts.events = opts.parent._events;
        this.$super(opts);
      },
      control: {
        config: {
          init: function(vals) {
            this.vals = this.konst(vals);
            return this;
          },
          read: function(key) {
            if (key) {
              return this[key] && this[key] instanceof Function ? this[key]() : this[key];
            }else {
              return this.reduce(function(v, k, i, o) {
                if (k === 'init' || k === 'read' || k === 'toggle') {
                  return v;
                }else if (v instanceof Function) {
                  return v(o);
                }else {
                  return v;
                }
              }, this.object());
            }
          },
          info: function(o) {
            return (o.vals ? o.vals() : {}).clone({ cid: o.root().cid() });
          },
          data: function(o) {
            var name = o.info.cid;
            return  {
              schema: 'schema.$app', name: name,

              path: name.replace('madi', 'tabs') + '.data.main.data',

              items: sys.lookup('schema.$app').lift(function(schema, name) {

                return schema.lookup([ name, 'nodes' ]).prop('keys').orElse([]).unit();

              }).ap(o.klass('functor').of(o.info.nodes)).prop('flat').prop('unique').orElse([]).unit()
            };
          },
          modal: function(o) {
            return { title: 'attr.desc', attach: '#root' };
          },
          tabs: function(o) {
            var schema = sys.get(o.data.schema);
            return o.data.items.reduce(function(r, v, i) {
              var tab = 'tab' + (i + 2);
              r[tab] = { id: tab, path: tab, name: schema.get(v, 'attr.desc') || schema.get(v, 'attr.code') };
              return r;
            }, { tab1: { id: 'tab1', path: 'tab1', name: 'General' } });
          },
          forms: function(o) {
            return o.data.items.reduce(function(r, v, i) {
              r[v] = 'tab' + (i + 2);
              return r;
            }, { form: 'tab1' });
          },
          fields: function(o) {
            return o.data.items.reduce(function(r, v, i) {
              r.map[v] = 'tab' + (i + 2);
              return r;
            }, { map: {}, def: 'tab1' });
          },
          buttons: function(o) {
            return {
              btn: { 'cancel': 'Cancel', 'delete': 'Delete', 'save': 'Save', 'add': 'Add' },
              map: { 'delete': { tab1: true, tab2: false }, 'add': { tab1: true, tab2: true } }
            };
          },
          proxy: function(o) {
            return {
              tabs: { 'click:li': { path: 'tabs.current' } },
              modal: { 'click:button': { path: 'modal.button' } }
            };
          },
          toggle: function (state) {
            if (state !== false && this.state('display') !== 'block') {
              this.display('block');
            }else if (state !== true) {
              this.display('none');
            }
            return this.state('display');
          },
          render: function(conf) {
            return conf.klass('io').lift(function(json, form) {
              var schema = sys.get(conf.data.schema);
              var deftab = conf.fields.def || 'tab1';
              var name   = json.marl || json.madi;
              var madi   = json.dbid.indexOf('madi') === 0 ? json.dbid : '';
              return this.fx(function() {
                var cid = form.cid(), fields;
                var map = conf.fields.map[cid] || deftab;
                if (madi && name !== madi) {//} && json.type && json.type.indexOf('sys.attr') === 0) {
                  fields = schema.control('main').extend(name || 'main', madi, conf.fields.map || {}, deftab);
                }else if (json.madi && name !== json.madi) {
                  fields = schema.control('main').extend(name || 'main', json.madi, conf.fields.map || {}, deftab);
                }else {
                  fields = schema.control('main').map(name || 'main', conf.fields.map || {}, deftab);
                }
                return form.fields(fields[map], true);
              });
            });
          }
        },
        admin: {
          load: function(data) {
            return this.io().run(data);
          },
          io: function() {
            return (this._io || (this._io = this.klass('io').lift(function(data, comp) {
              var madi = data.marl || data.madi;
              var node = comp.get('modal').get('model').load(data.dbid);

              if (node.children().length()) {
                node.children().clear();
              }
              node.clear();
              node.parse(data, true);
              comp.lookup('form').map(function(form) {
                return form.control('main').loading(form, node);
              });
              comp.control('config.data.items').map(function(name) {
                return comp.get(name).control('main').show(name, node, node.get(name) || node.child(name));
              });
              return comp;
            })));
          },
          handler: function(empty) {
            return function $run(v) {
              var x = empty.clone(v.attr ? v.attr.clone({
                dbid: v.dbid,
                lnid: v.lnid,
                madi: v.madi,
                madr: v.madr,
                marl: v.marl,
                marr: v.marr,
                type: v.dimension
              }).clone(v.event || {}) : v);
              if (v.nodes && v.nodes.length) {
                return v.nodes.reduce(function(r, v) {
                  r.result[v] = r.value[v].map($run);
                  return r;
                }, { value: v, result: x }).result;
              }else {
                return x;
              }
            }
          },
          conf: function(base, conf) {
            // Helper: conf extends base
            return conf.clone(base);
          },
          proxy: function(proxy, component) {
            if (proxy) {
              proxy.map(function(v, k) {
                var evt = k.split(':');
                component.proxy(evt.shift(), evt.pop(), v.path, v.action, v.closest);
              });
              return component;
            }
          },
          setup: function() {
            return (this._setup || (this._setup = this.klass('io').of(function(base, main, conf, modal, tabs, formss, json) {
              var forms  = formss instanceof Array ? formss : [ formss ];
              var schema = sys.get(conf.data.schema);
              var deftab = conf.fields.def || 'tab1';
              var name   = json.marl || json.madi, fields;
              var data   = modal.set('model', sys.get('model').instance(modal.cid()).instance(name, conf.data.schema));
              var src    = data.source(modal);
              var node   = data.record(json.dbid);

              data.observe('change', '%', main.handler('data.control.schema.change'));
              modal.get('data').set('model', data);
              modal.view().read().run('main', conf.modal.clone({
                bindpath: '%current',
                title: schema.get(name, 'meta', 'desc') || conf.modal.title
              }));

              if (conf.proxy) {
                base.proxy(conf.proxy.tabs, tabs);
                base.proxy(conf.proxy.modal, modal);
              }
              if (conf.modal && conf.modal.toggle) {
                modal.toggle = conf.modal.toggle;
              }

              conf.buttons.btn.map(function(label, value) {
                var map = conf.buttons.map[value];
                return modal.addButton(value, label, !map || map[deftab] !== false);
              });

              tabs.attach(modal.get('data.tmpl.body').run());
              data.observe('change', '%', modal.handler('binding'));
              modal.attach(main.module().$el());

              var rndr = conf.render.run(json);
              var load = [ modal, tabs ].concat(conf.forms.map(function(v, k, i) {
                var form = forms[i];
                var make = form.set('data.make', rndr.run(form));
                form.bindpath('%current', data);
                data.observe('change', '%', form.handler('binding'));
                return [ make.run(), tabs.item(conf.tabs[v]).cont() ];
              }));

              return load.lift(function() {

                return [].slice.call(arguments).reduce(function(r, v, i) {
                  if (i === 0) {
                    r.modal = v;
                  }else if (i === 1) {
                    r.tabs = v;
                  }else {
                    if (i === 2) {
                      r.tabs.tab(deftab);
                    }
                    v.first().attach(v.last().value.$pane);
                  }
                  return r;

                }, {}).modal.parent();

              }).cont();
            }).lift(function(fn, data) {
              return this.fx(function(args) {
                return fn.apply(undefined, args.concat([ data ]));
              });
            })));
          },
          make: function(data) {
            var root = this.root();
            var name = root.cid();
            var conf = root.control('config').init({
              nodes: name === 'madi' ? [ 'madi' ] : [ data.madi, data.marl, data.dbid ].filter(function(x) {
                return x && x.indexOf('madi') === 0;
              })
            }).read();
            var info = sys.get('schema.$app').get(data.madi || name);

            return Array.of(

              this,
              root,
              conf,

              root.component('modal', 'modal', {
                attrs: { 'class' : root.parent().equals('components') ? 'modal' : 'modal inline', 'role' : 'form' }
              }).pure(),

              root.component(name.replace('madi', 'tabs'), 'tabs').pure(),

              conf.forms.map(function(v, k, i) {
                if (i === 0) {
                  return info.lookup('meta.form').map(function(path) {
                    return sys.eff('sys.loader.component').run(path).bind(function(c) {
                      return c.create({ name: k, parent: root }).pure();
                    }).cont();
                  }).orElse(function() {
                    return root.component(k, 'form').pure();
                  }).unit();
                }else {
                  return root.component(k, 'form').pure();
                }
              })

            ).cont().lift(this.setup().run(data));
          }
        },
        schema: {
          change: function(evt) {
            if (evt.target === 'remove' && typeof evt.value === 'string' && evt.value.indexOf('.') > 0) {
              sys.$find(evt).lift(function(data, root) {
                var code = evt.value.split('.').shift();
                var list = data.get(code), node, chld;
                if (list && data.get(evt.value)) {
                  var remove = data.clear(evt.value);
                  data.child('remove').parse(remove);
                  chld = list.children();
                  node = chld.values(true);
                  chld.clear();
                  list.parse(node.keys().reduce(function(r, k, i) {
                    r[i+''] = node[k];
                    return r;
                  }, {}), true);
                  root.get(code).control('main').show(code, data);
                }
              }).ap(this.root());
            }else if (evt.action === 'create' && evt.target === 'dbid' && evt.level > 3) {
              sys.$find(evt).chain(function(node) {
                node.set('style.btn.edit', [ 'display', evt.value ? 'block' : 'none' ].join(':'));
                node.set('style.btn.record', [ 'display', node.parent().equals('rcrds') ? 'none' : 'block' ].join(':'));
                node.set('style.$$skip', true);
              });
            }
          },
          order: function(evt) {
            console.log(evt);
          }
        },
        modal: {
          toggle: function(evt) {
            if (evt.target === 'button') {
              var root = this.root();
              var conf = root.control('config').read('data');
              return root.get('modal.model').current().chain(function(data) {
                var code = data.get('dbid');//.replace('mare', data.get('madi'));
                if (evt.value === 'cancel') {
                  root.reload({ value: code });
                }else if (evt.value === 'add') {
                  var tabs = root.get(conf.name.replace('madi', 'tabs'));
                  var indx = tabs.get('data.main.tabs').index(tabs.tab());
                  if (indx) {
                    code = conf.items[indx-1];
                    data.push(code);
                    root.get(code).control('main').show(code, data);
                  }else {
                    root.module().parent().lookup('nav').map(function(nav) {
                      return nav.current().chain(function(curr) {
                        curr.maybe('data.main.menu', code, 'marl').chain(function(marl) {
                          nav.set('data.current.item', marl.replace('madi', code.replace('madi', 'create')));
                        });
                      });
                    });
                  }
                  return evt;
                }else if (evt.value === 'save' || evt.value === 'delete') {
                  return sys.get('api').get('db', evt.value).request().run({
                    data: data.values(true, false, true)
                  }).run(function(result) {
                    console.log(result);
                    if (result.meta) {
                      sys.lookup('schema.$app').chain(function(schema) {
                        schema.clear(result.dbid);
                        return schema.parse(result.meta, 3, true);
                      });
                    }
                    if (result.dbid === code) {
                      root.reload({ value: result.dbid });
                    }else {
                      root.reload({ value: result.dbid }, code);
                    }
                  });
                }
              });
            }
          }
        },
        tabs: {
          toggle: function(evt) {
            if (evt.target === 'current') {
              var root = this.root();
              var conf = root.control('config').read('data');
              root.lookup('modal').map(function(node) {
                return node.get('data.main.buttons');
              }).prop('map', function(v, k) {
                if (k == 'add') {
                  v.$el.style.display = evt.value != 'tab1' ? 'block' : 'none';
                }else if (k == 'delete') {
                  v.$el.style.display = evt.value == 'tab1' ? 'block' : 'none';
                }
              });
            }
            return evt;
          }
        }
      },
      events: {
        data: {
          'change:tabs.current':'data.control.tabs.toggle',
          'change:modal.button':'data.control.modal.toggle',
          'change:drag.drop':'data.control.schema.order',
          'change:state.current':'data.control.state.current'
        }
      }

    };
  });

});
