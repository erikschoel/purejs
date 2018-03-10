define(function() {

  return this.enqueue({

    name: 'core.instance',

    deps: {

      core: [ 'pure', 'dom' ]

    }

  }, function() {

    return {

      init: function(deps) {
        return deps('core.pure')(function(sys) {
          return function(app) {
            return app.make(app.type, sys.klass('ctor').parse(app.klass), sys);
          }
        })(this);
      },

      klass: {
        klass: function Instance(arg) {
          this.id = this.ctor.$id = this.id();

          if (this.$store.is(arg)) {
            this.init(arg.get('type')).set(arg);
          }else {
            this.init(arg);
          }
        },
        ext: [
          (function of(arg) {
            return new this.constructor(arg);
          }),
          (function init(arg) {
            var type = typeof arg == 'string' ? this.klass(arg) : arg;
            var code = this._type = type.$code, args, vals, inst, inid;
            var node = this.$store.get(code);
            if (!node) {
              node = this.$store.child(code);
              inid = node.set('inid', this.$fn.tmpid());
              args = node.set('args', this.$fn.args(type.$ctor));
              vals = node.set('vals', args.reduce(function(r, a) {
                if (a == 'x') r.vals.push(r.type.prop('mv'));
                if (a == 'f') r.vals.push(r.type.prop('mf'));
                return r;
              }, { type: type, vals: [] }).vals);
              inst = node.child('inst');
            }
            return this;
          }),
          (function title() {
            return this.lookup('inid').orElse(this.val('inid')).lift(function(inid, name) {
              return inid + (name ? (' - ' + name) : '');
            }).ap(this.lookup('name').orElse('')).unit();
          }),
          (function lookup(key) {
            return this.$store.get(this._type, 'inst').lookup('%current'.concat('.', key));
          }),
          (function get(key) {
            return this.$store.get(this._type, 'inst', '%current', key);
          }),
          (function val(key) {
            return this.$store.get(this._type, key);
          }),
          (function set(arg, clear) {
            return this.node(arg, clear);
          }),
          (function remove(inid) {
            return this.$store.get(this._type, 'inst').clear(inid);
          }),
          (function node(arg, clear) {
            var store = this.$store.get(this._type, 'inst');
            var name  = store.is(arg) ? arg.get('name') : arg.name;
            var code  = name.toTypeCode();
            var isarg = store.is(arg);
            var inid  = isarg ? arg.get('inid') : arg.inid;
            if (inid == this.val('inid')) inid = this.$fn.inid();
            var node  = store.get(inid) || store.child(inid, this.$schema.$record);
            if (clear) node.clear();
            if (!isarg) {
              arg.inid = inid;
              node.parse(arg, true);
            }else if (!node.equals(arg)) {
              arg.set('inid', inid);
              node.parse(arg.values(true), true);
            }
            if (!this.$index.get(inid)) this.$index.set(inid, node.uid());
            return store.get(store.set('current', inid));
          }),
          (function data(vals, newid) {
            vals || (vals = {});
            vals.type = this._type;
            if (newid || !vals.inid) vals.inid = this.val('inid');
            var node  = this.schema('inst', vals);
            if (!node.argx && this.has('x')) node.argx = this.arg('x') || '';
            if (this.has('f')) node.argf = this.$fn.toString(node.argf || this.arg('f'));
            return node;
          }),
          (function schema(name, vals) {
            return this.$schema.control('main').add(name, vals);
          }),
          (function has(k) {
            var index = this.val('args').indexOf(k);
            return index > -1 ? true : false;
          }),
          (function arg(k) {
            var idx = this.val('args').indexOf(k);
            if (idx > -1) return this.val('vals').at(idx);
          }),
          (function cast(v) {
            try {
              if (v && typeof v == 'string') {
                return self.eval('(' + v + ')');
              }
              return v;
            }catch(e) {
              console.log(e);
              return v;
            }
          }),
          (function cont(inst, func, args) {
            return function $_pure(k) {
              var result;
              try {
                result = inst[func].apply(inst, args);
              }catch(e) {
                console.log(e);
                result = inst;
              }
              return k(result);
            }
          }),
          (function fn() {
            var args = [].slice.call(arguments);
            return this.cont(args.shift(), args.shift(), args.map(this.cast));
          }),
          { name: '$op', value: {
            cast: function(i, f, m) {
              var x = typeof m == 'string' ? this.cast(m) : m;
              if (typeof x == 'string' && x.match(/^(DB|IN)/)) {
                return this.fn(i, f, this.find(x).map(function(inst) {
                  return inst.make();
                }).orElse(m).unit());
              }else {
                return this.fn(i, f, m);
              }
            },
            ap: function(i, m) {
              return this.$op.cast.call(this, i, 'ap', m);
            },
            lift: function(i, m) {
              return this.$op.cast.call(this, i, 'lift', m);
            },
            chain: function() {
              var args = [].slice.call(arguments);
              return this.fn.apply(this, [ args.shift(), 'chain' ].concat(args));
            },
            run: function() {
              var args = [].slice.call(arguments);
              return this.fn.apply(this, [ args.shift(), 'run' ].concat(args));
            }
          } },
          (function make(store) {
            store || (store = this.get());
            var klass = this.klass(store.get('type'));
            var inst  = klass[store.get('func') || 'of'].apply(klass, this.val('args').reduce(function(r, a) {
              var arg = r.inst.get('arg'+a);
              if (arg) r.vals.push(r.inst.cast(arg));
              return r;
            }, { vals: [], inst: this }).vals);

            var inop = store.get('inop').children();
            if (inop && inop.length()) {
              inst = inop.reduce(function(r, v) {
                var ext = {};
                if ((ext.method = v.get('method'))) {
                  ext.func = ext.method.toLowerCase();
                  ext.argm = v.get('argm');
                  if (r.self.$op[ext.func]) {
                    r.inst = r.self.$op[ext.func].call(r.self, r.inst, ext.argm)(unit);
                  }else {
                    r.inst = r.self.fn(r.inst, ext.func, ext.argm)(unit);
                  }
                }
                return r;
              }, { self: this, inst: inst }).inst;
            }
            return inst;
          }),
          (function $run() {
            var args = [].slice.call(arguments);
            if (!args.length) {
              var argr = this.get('argr');
              if (argr) args.push(argr);
            }
            args.unshift(this.make(), 'run');
            return this.klass('Cont').of(this.fn.apply(this, args));
          })
        ],
        attrs: [
          (function of(arg) {
            return new this(arg);
          })
        ]
      },

      type: {
        schema: {
          inst: {
            fields: {
              inid:   { type: 'string',   elem: { tag: 'input',   label: 'INID', type: 'text', placeholder: 'inid'  } },
              dbid:   { type: 'string' },//,   elem: { tag: 'input',    label: 'DBID', type: 'text', placeholder: 'dbid'  } },
              name:   { type: 'string',   elem: { tag: 'input',   label: 'Name', type: 'text', placeholder: 'name'  } },
              info:   { type: 'string',   elem: { tag: 'textarea',  label: 'Info', type: 'text', placeholder: 'info'  } },
              type:   { type: 'string',   elem: { tag: 'select',    label: 'Type', data: 'options:types.index.fn.keys', options: [] } },
              func:   { type: 'string',   defv: 'of', elem: { tag: 'select',    label: 'Func', options: [ 'of', 'pure', 'lift' ], empty: false } },
              argx:   { type: 'function', elem: { tag: 'component', label: 'Argument X', klass: 'code-edit', attrs: { style: { display: 'none' } } } },
              argf:   { type: 'function', elem: { tag: 'component', label: 'Argument F', klass: 'code-edit', attrs: { style: { display: 'none' } } } },
              // method: { type: 'string',   elem: { tag: 'select',    label: 'Method', options: [ 'Map', 'Bind', 'Lift', 'Ap', 'Chain' ] } },
              // argm:   { type: 'function', elem: { tag: 'component', label: 'Argument to Method', klass: 'code-edit' } },
              argr:   { type: 'function', elem: { tag: 'component', label: 'Argument to Run', klass: 'code-edit' } }
            },
            nodes: {
              inop:   { type: 'schema' }
            }
          },
          inop: {
            fields: {
              dbid:   { type: 'string' },//,   elem: { tag: 'input',    label: 'DBID', type: 'text', placeholder: 'dbid'  } },
              method: { type: 'string',   elem: { tag: 'select',    label: 'Method', options: [ 'Map', 'Bind', 'Lift', 'Ap', 'Chain', 'Pure', 'To', 'Run' ] } },
              argm:   { type: 'function', defv: '', elem: { tag: 'component', label: 'Argument to Method', klass: 'code-edit' } }
            }
          }
        },
        parse: function() {
          return sys.klass('io').pure(function(klass) {
            return this.fx(function(item) {
              if (item && item.data && item.data.type) {
                var data  = item.data;
                var inst  = klass.of(data.type);
                data.dbid = parseInt(item.dbid);
                data.inid = item.inid || ('DB' + (1000000 + data.dbid));
                var node  = inst.set(inst.data(data));
                return node;
              }else if (item && item.dbid && item.inid) {
                var inst  = klass.of(item.type);
                var dbid  = parseInt(item.dbid);
                if (dbid < 0) inst.remove(item.inid)
              }
            });
          });
        },
        load: function() {
          return this.klass('Cont').extend(function ContLoadInst(mv, mf) {
            this.$$init(this.$cast(mv), mf);
          }, {
            mf: function(data) {
              return sys.get('async.request')({
                url: 'server/load-main-instance.php', parse: true, data: data
              });
            }
          }, {
            io: this,
            fn: function(r) {
              return r;//r.collect();
            },
            of: function(data) {
              return new this(data).ap(this.io).bind(this.fn);
            }
          });
        },
        kont: function() {
          return sys.klass('Cont').extend(
            function SaveInstanceCont(mv, mf) {
              this.$super(mv, mf);
            }, {
              mf: sys.get('async.request')
            }, {
              of: function(node) {
                return new this({
                  url: 'server/save-main-instance.php',
                  type: 'POST', parse: true,
                  data: JSON.stringify({
                    inid: node.get('inid'),
                    dbid: node.get('dbid'),
                    type: node.get('type'),
                    data: node.values(true, true)
                  })
                });
              }
            }
          ).$ctor;
        },
        save: function(cont) {
          return function() {
            return cont.of(this.get()).lift(this.$fn.parse);
          }
        },
        $make: function() {
          return this.find('io').make(function InstIO(x) {
            this.$super(x);
          }, [].slice.call(arguments).shift());
        },
        $find: function() {
          return this.find('io').of(this).lift(function(klass, index) {
            return this.fx(function(inid) {
              return index.get(inid).map(function(uid) {
                return index.find(uid);
              }).map(function(arg) {
                return klass.of(arg);
              });
            });
          });
        },
        find: function($find) {
          return function(inid) {
            return $find.run(inid);
          }
        },
        make: function($maybe) {
          return $maybe.chain(function(inst) {
            return inst.make();
          });
        }
      },

      make: function(type, klass, sys) {
        var parse = type.parse().run(klass);
        klass.prop('$fn', {
          args: sys.get('utils.getArgs'), toString: sys.get('utils.toString'),
          inid: klass.makeID('IN'), tmpid: klass.makeID('TMP'), parse: parse
        });
        var proto = klass.constructor.prototype;
        var store = klass.prop('$store', sys.get().child('instance'));
        var index = klass.prop('$index', store.child('index'));
        var $find = proto.$find = klass.prop('find', type.find(type.$find.call(klass).run(index.maybe())));
        var $make = type.$make.call(klass, sys.get('utils.compose')($find)(type.make));
        var lstnr = sys.klass('Listener').$ctor;
        store.listener = lstnr.init('instance', 'store');
        store._events  = sys.get('events').child({ name: 'events', parent: store });

        // === SCHEMA === //
        var schema = klass.prop('$schema', sys.get('schema').child('$instance'));
        schema.parse(type.schema, 3, true);

        // === PROGRAM === //
        // var program = klass.prop('$program', sys.get('schema').child('$program'));
        // program.parse(type.program, 3, true);

        klass.prop('save', type.save(type.kont()));
        proto.load = type.load.call(parse);
        return klass;
      }

    };

  });

});
