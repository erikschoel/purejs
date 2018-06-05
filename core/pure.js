(function() {
  return (self.sys = [].slice.call(arguments).apply().load('sys'));
})(

  (function MakeApp(_) {

    return _.apply(undefined, [].slice.call(arguments, 1));
  })(
    (function run(init, base, parse) {
      return function(sys, root) {
        return parse.apply(base.call(init(sys, root)), [].slice.call(arguments, 2));
      }
    }),
    (function init(sys, base) {
      return base.shift().apply(sys, base);
    }),
    (function base() {
      this.location().save('loc');

      this.load('loc').lift(function(s, f) {
        return f && f instanceof Function ? (f.length ? f.call(s, this) : f.call(s)) : s;
      }).run('sys').save('sys');

      this.load('loc').lift(function(ctor, v) {
        var def = v instanceof Function ? v.call(this) : v;
        if (def.klass && def.klass.name == 'Bind') {
          def.ext.unshift(def.ext.remove(2).shift().call(undefined, this.get('utils.extend'),
            { pure: true, arr: true, val: true, cont: false, other: true, done: true }));
        }
        if (def.parent) {
          ctor.find(def.parent).parse(def);
        }else if (def.klass) {
          ctor.parse(def);
        }
        return this;
      }).run('types.type').save('make');
      return this;
    }),
    (function parse() {
      return this.map(function(i) {
        return i.reduce(function(r, v) {
          if (v[0] && v[0].name && v[0].name.substr(0, 2) == '$$') {
            v.shift().apply(r, v);
          }else {
            var make = r.load('make');
            while (v.length) {
              make.run(v.shift());
            }
          }
          return r;
        }, this);
      }).save('parse').run([].slice.call(arguments));
    })
  ),

  (function MakePure() {
    // ===== expose pure to array and pass it on ==== //
    return [].slice.call(arguments).shift();
  })(
    (function core(s, u, c, e, r, n, w, t, p, d, i) {
      return { define: self.define = d, is: i, isWorker: w, log: t(console.log.bind(console)), fn: s.call({}, self.unit = u, c, e, p, r, n) };
    })(
      (function sys(u, c, e, p, r, n) {
        this.unit     = u;
        this.$const   = c;
        this.extract  = e;
        this.pure     = p;
        this.curry    = r;
        this.now      = n;
        return this;
      }),
      // ==== identity ======== //
      (function unit(t) {
        return t;
      }),
      // ==== constant ======== //
      (function $const(a) {
        return function() {
          return a;
        }
      }),
      (function extract(v) {
        return function $_pure(k) {
          return k(v);
        }
      }),
      (function curry(fn, bound, numArgs, countAllCalls) {
        if (((numArgs = numArgs || fn.length) < 2)) return fn;
        else if (!bound && this != self) bound = this;

        var countAll = countAllCalls !== false;
        return function f(args, ctx) {
          return function $_curry() {
            if (bound && !args.length) ctx = bound === true ? this : bound;
            var argss = [].slice.apply(arguments);
            if (countAll && !argss.length) argss.push(undefined);
            if ((args.length + argss.length) < numArgs) {
              return f(args.concat(argss), ctx);
            }else {
              return fn.apply(ctx, args.concat(argss));
            }
          }
        }([]);
      }),
      (self.now = (function(run) {
        return run();
      })(
        (function() {
        var perf = self.performance;
        if (perf && (perf.now || perf.webkitNow)) {
          var perfNow = perf.now ? 'now' : 'webkitNow';
          return perf[perfNow].bind(perf);
        }else { return Date.now; }
      }))),
      (function() {
        var self = this; return (self.document === undefined);
      })(),
      (function tap(f) {
        return function(x) {
          return unit(x, f(x));
        }
      }),
      (function(pure) {
        this.pure = function() {
          return pure(Array.apply(arguments));
        };
        this.of = function() {
          return [].slice.call(arguments);
        };
        return (this.prototype.$pure = pure);
      }).call(Array,
        // ===== wraps the array in pure ==== //
        (function MakePure($pure) {
          this.prototype.pure = function(idx, remove) {
            return typeof idx != 'undefined' &&
              idx < this.length && this[idx] instanceof Function
                ? (remove ? this.remove(idx).at(0)(this) : this[idx](this)) : $pure(this);
          };
          return $pure;
        }).call(Array,
          (function(t) {
            return function $_pure(f) {
              return f(t);
            }
          })
        ),
        // ===== calls fn over array: [ fn.apply(undefined, arg1, arg.., arg...) ] ==== //
        (function MakeApply($apply) {
          this.prototype.apply = function(idx, recur) {
            if (recur || idx === true) {
              return $apply(this);
            }else if (idx instanceof Function) {
              return idx.apply(undefined, this.slice(0));
            }else {
              return this[idx||0].apply(undefined, this.slice((idx||0)+1));
            }
          };
        }).call(Array,
          (function apply(bind) {
            return function $apply(x) {
              if (x instanceof Array) {
                return bind($apply)(x).apply();
              }else {
                return x;
              }
            }
          })(
            (function bind(f) {
              return function(x) {
                return Array.prototype.concat.apply([], x.map(f));
              }
            })
          )
        ),
        // ===== more functional array ====== //
        (function MakeArray() {
          String.prototype.$_like = new RegExp("([\\.\\\\\\+\\*\\?\\[\\^\\]\\$\\(\\)\\{\\}\\=\\!\\<\\>\\|\\:\\-])", "g");
          String.prototype.$_matches = String.prototype.$like = function() {
            var search = this.replace(this.$_like, "\\$1");
            search = search.replace(/%/g, '.*').replace(/_/g, '.');
            return RegExp('^' + search + '$', 'gi');
          };
          String.prototype.part = function(index, delim) {
            return this ? this.split(delim || '.').at(index || 0) : '';
          };
          String.prototype.first = function() {
            return this.part(0);
          };
          String.prototype.parts = function(index, delim) {
            return this.split(delim || '.').slice(index || 0).join(delim || '.');
          };
          String.prototype.matches = String.prototype.like = function(search) {
            if (typeof search !== 'string' || this === null) { return false; }
            return search.$like().test(this);
          };
          String.prototype.isLowerCase = function(from, to) {
            return typeof from == 'number' ? this.substr(from, to || (this.length - from - 1)).isLowerCase() : (this.toLowerCase() == this);
          };
          String.prototype.isUpperCase = function(from, to) {
            return typeof from == 'number' ? this.substr(from, to || (this.length - from - 1)).isUpperCase() : (this.toUpperCase() == this);
          };
          String.prototype.toCamel = function(){
            return this.length < 3 ? this.toLowerCase() : this.replace(/\$/g, '').replace('.', '').replace(/(^[a-z]{1}|\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
          };
          String.prototype.toDash = function() {
            return this.length < 2 ? this.toLowerCase() : this.replace(/\s+/g, '').replace(/([A-Z][^A-Z])/g, function($1, p1, pos){return (pos > 0 ? "-" : "") + $1.toLowerCase();});
          };
          String.prototype.quote = function() {
            return [ '\'', this || '', '\'' ].join('');
          };
          String.prototype.toTypeCode = function() {
            return [ '$', this.split('$').pop().toDash() ].join('').toLowerCase();
          };
          String.prototype.toTypeName = function() {
            return this.replace(/-/g, '').replace('$', '').substr(0, 1).toUpperCase() + this.slice(1);
          };
          String.prototype.toRegular = function() {
            return this.length ? this.toTypeCode().replace('$', '') : '';
          };
          String.prototype.toKey = function() {
            return this.length ? this.substr(0, 1).toLowerCase().concat(this.slice(1)) : this;
          };
          String.prototype.path = function(rel, full) {
            return rel ? (full ? [ rel ] : []).concat(this.split('.').slice(rel.split('.').length)).join('.') : this;
          };
          this.prototype.insert = function(position) {
            var pos = position < 0 ? (this.length + position) : position;
            this.push.apply(this, this.splice(0, pos).concat([].slice.call(arguments, 1)).concat(this.splice(0)));
            return this;
          };
          this.prototype.merge = function(arr) {
            var idx = 0, len = this.length;
            while (arr.length && idx < len) {
              this.insert((idx++ * 2) + 1, arr instanceof Array ? arr.shift() : arr);
            }
            return this;
          };
          this.prototype.exclude = function() {
            var arr = Array.prototype.concat.apply([], [].slice.call(arguments).map(function(a) {
              return a instanceof Array ? a : (typeof a === 'object' ? Object.keys(a) : [ a ]);
            }));
            return this.filter(function(v) {
              return arr.indexOf(v) < 0;
            });
          };
          this.prototype.of = function() {
            return this[0](this.slice(1));
          };
          this.prototype.at = function(index) {
            return this.length && index < this.length ? this[index] : null;
          };
          this.prototype.first = function() {
            return this.length ? this.at(0) : [];
          };
          this.prototype.last = function() {
            return this.length ? this.at(this.length - 1) : [];
          };
          this.prototype.bimap = function(f, i) {
            return typeof i == 'undefined' ? this.map(f) : this.slice(0, 1).concat(this.slice(i).map(this.fn.bin(f)(this.first())));
          };
          this.prototype.until = function(index) {
            return this.length ? this.splice(0, index) : [];
          };
          this.prototype.remove = function(index, howmany) {
            return this.length ? this.splice(index, howmany || 1) : [];
          };
          this.prototype.flat = this.prototype.flatten = function() {
            return Array.prototype.concat.apply([], this);
          };
          this.prototype.unique = function() {
            return this.filter(function(value, index, self) { 
              return self.indexOf(value) === index;
            });
          };
          this.prototype.obj = function() {
            var values = [].slice.call(arguments).flat();
            return this.reduce(function(r, v, i) {
              if (!v) return r;
              else if (values.length) r[v] = values[i];
              else if (v.name) r[v.name] = v;
              return r;
            }, {});
          };
          this.prototype.prepend = function() {
            return (0*this.unshift.apply(this, [].slice.call(arguments).flat())) || this;
          };
          this.prototype.append = function() {
            return (0*this.push.apply(this, [].slice.call(arguments).flat())) || this;
          };  
          this.prototype.replace = function(i, v) {
            this.splice(i || 0, 1, v);
            return this;
          };
          this.prototype.arr = function() {
            return this.constructor.arr(this);
          };
          this.arr = function(arr) {
            return function $_arr(f) {
              return f ? f(arr) : arr;
            };
          };
          this.range = function(m, n) {
            return Array.apply(null, Array(n - m + 1))
            .map(function (n, x) {
              return m + x;
            });
          };
        }).call(Array)
      ),
      // ==== fake require.js define function === //
      (function(a, d, r) {
        return a(d(r));
      })(
        (function(d) {
          return d;
        }),
        (function(require) {
          return function define() {
            var args  = [].slice.call(arguments), test,
              deps  = args.first() instanceof Array ? args.shift() : [],
              func  = args.first(), mods = {},
              klass = sys.klass('Cont'), cont, node;
            if (func.length) {
              if (func.name == '$_store') {
                node = require()
                args.push(node);
                cont = args.apply();
                cont.ref = node.uid();
                return cont;
              }else {
                args.push(unit, mods, {});
                args.apply();
                test = require(mods.exports).set('cont', args.slice(2).reduce(function(r, v, i) {
                  if (r.length) {
                    return r;
                  }else if (v.exports) {
                    r.push(v.exports);
                  }
                  return r;
                }, []).shift());
              }
            }else {
              test = sys.load('sys').run(args.first());
            }
            if (klass.test(test.constructor)) {
              if (!test.ref) {
                node = require(test);
                return node.set('cont', test.attr('ref', node.uid()));
              }else {
                return test;
              }
            }else {
              if ((node = sys.get('assets').get(test.name) || require(test))) {
                if (!test.name || test.name.slice(-4) != 'json') {
                  cont = node.get('cont');
                  if (cont) return cont;
                }
                if (test && (cont = klass.of(test))
                  && cont.attr('name', test.name))
                    cont.attr('ref', node.uid());
                return node.set('cont', cont);
              }
            }
            return node || cont || test;
          };
        }),
        (function require(def) {
          var path, head, tag, type, node, ref, json;
          if (def && def.ref) {
            return sys.find(def.ref);
          }else if (def && def.name) {
            path = def.name.split('.');
            type = path.first();
            if (path.length == 1) {
              if (node = sys.get('assets').get('components', path, path.last())) {
                return node;
              }else if (node = sys.get('assets').get('libs', path)) {
                return node;
              }
            }else if (type == 'modules') {
              path.append(path.last());
            }else if (path.last() == 'json') {
              return type == 'config' ? sys.get('assets').get('config', path) : sys.get('assets').get('json', path.slice(0, -1));
            }
            return sys.get('assets').get(path);
          }else {
            head = document.getElementsByTagName('head').item(0).getElementsByTagName('script');
            tag  = head.item(head.length-1);
            ref  = tag.getAttribute('data-ref');
            return sys.find(ref);
          }
        })
      ),
      (function is(v) {
        return v && v instanceof this.ctor.base ? true
        : (v && v.name && this.ctor.find(v.name) ? true : (v && v.base == this.ctor.base ? true : false));
      })
    )
  ),

  (function MakeRoot() {

    return [].slice.call(arguments);
  })(
    // === INIT === //
      (function(CTOR, DB, Store, Utils, Parse, Node, Functor, Arr, Compose, Cont, Reader) {

        var $Base  = CTOR.shift().apply(this, CTOR);
        var $CTOR  = new $Base($Base);
        var $DB    = $CTOR.parse(DB);
        var $Store = $CTOR.parse(Store);

        $DB.add();
        $Store.add();

        var $Base    = $CTOR.$store.set('type', $CTOR).$store.root;
        var $Utils   = Parse(this, Utils($Base.child('utils')));
        var $Root    = $CTOR.parse(Node).$store.root;
        var $Sys     = $Root.set('sys', this);
        var $Functor = $CTOR.parse(Functor);

        var $ARRAY   = $CTOR.parse(Arr);
        var $Compose = $Functor.parse(Compose);
        var $Cont    = $Functor.parse(Cont);
        var $Reader  = $Compose.parse(Reader);

        return $Reader.of();
      }),
    // === CTOR === //
      (function CTOR() {
        return [].slice.call(arguments);
      })(
        (function(ctor, proto, make, extend, named, base) {
          base.prototype.sys = this.fn.$const(this);
          extend.constructor.prototype.base = base;
          return named.call(
            make.call(
              extend.inherit(ctor, base,
                proto.call({ ctor: ctor, base: base, extend: extend }))));
        }),
        (function $CTOR(ctor, attrs, parent) {
          this.ctor(ctor, attrs, parent);
        }),
        (function() {
          return {
            constructor: this.ctor,
            of: function(ctor, attrs, parent) {
              return new this(ctor, attrs, parent);
            },
            is: function(value) {
              if (this.__) return value && value instanceof this.__;
              else if (this.$ctor && this.$ctor.__) return value && value instanceof this.$ctor.__;
              else if (this.$ctor) return value && value instanceof this.$ctor;
            },
            base: this.base,
            sys: this.base.prototype.sys,
            inherit: this.extend.inherit,
            mixin: this.extend.mixin,
            ctor: function(ctor, attrs, parent) {
              this.$ctor = ctor;
              this.$code = '$'+this.constructor.name.replace('$', '').toDash().toLowerCase();
              this.prop('id', this.makeID(this.prop('prefix', ctor.name.replace('$', '').substr(0, 2).toUpperCase())));
              this.init(ctor, attrs, parent);
            },
            init: function(ctor, attrs, parent) {
              if (this instanceof ctor) {
                ctor.prototype._level = 0;
                ctor.prototype.root = this.sys().fn.$const(this);
                ctor.prototype.tid = this.makeID(100000);
              }else {
                if (parent) this._parent = parent.$code;
                this.constructor.prototype._level = parent ? (parent._level + 1) : 0;
                ctor.ctor = ctor.prototype.ctor = this.add();
              }
              if (!ctor.prototype.$super) ctor.prototype.$super = this.$super;
              if (!ctor.prototype.$parent) ctor.prototype.$parent = this.$parent;
              if (attrs && attrs instanceof Function) {
                ctor.prototype.ctor = attrs;
              }else if (typeof attrs == 'object') {
                this.mixin(attrs, ctor);
              }
              if (!ctor.of) ctor.of = parent ? parent.$ctor.of : this.of;
              this.of = this.$ctor.$of = ctor.of.bind(ctor);
              if (ctor.pure) this.pure = ctor.$pure = ctor.pure.bind(ctor);
              else this.pure = ctor.$pure = this.of;
              if (ctor.lift) this.lift = ctor.$lift = ctor.lift.bind(ctor);
              if (!ctor.prototype.to) ctor.prototype.to = this.to;
              if (!ctor.prototype.is) ctor.prototype.is = this.is;
            },
            parent: function(name) {
              var type = name ? this.find(name) : this;
              var prnt = type._parent == '$ctor' ? this.root() : (this.$store && this.$store._ref ? this.$store.parent('type') : this.find(type._parent));
              var args = [].slice.call(arguments, 1);
              return prnt ? (args.length ? prnt.get(args.join('.')) : prnt) : null;
            },
            level: function() {
              return this._level;
            },
            name: function() {
              return this.$ctor.name.toDash();
            },
            add: function() {
              var uid;
              if (this.$store && this.$store.child) {
                this.constructor.prototype.$store = this.$store.child(this.$code);
                if ((uid = this.$store.set('type', this).$store.uid()) && !this.$index.get(this.$code)) this.$index.set(this.$code, uid);
              }
              return this;
            },
            update: function(base, ext, keys) {
              var xtnd = this.xtnd || (this.root().prop('xtnd', this.sys().get('utils.extend')));
              if (!base) {
                return ext ? xtnd({}, ext) : {};
              }else if (!ext) {
                return xtnd({}, base);
              }else if (keys) {
                var result = xtnd({}, base);
                return Object.keys(ext).reduce(function(r, k, i) {
                  if (r[k] && typeof r[k] === 'object') r[k] = xtnd(xtnd({}, r[k]), ext[k]);
                  else r[k] = ext[k];
                  return r;
                }, result);
              }else {
                return xtnd(xtnd({}, base), ext || {});
              }
            },
            create: function(/* name, ctor */) {
              var args = [].slice.call(arguments);
              var ctor = args[0] instanceof Function ? args.shift() : (args.length > 1 ? args.pop() : null);
              var name = typeof args[0] == 'string' ? args.shift() : (ctor ? ctor.name : this.$ctor.name);
              var child = this.named(name);
              child.prototype = { constructor: child, ctor: ctor };
              return this.extend(child);
            },
            make: function(ctor, proto) {
              if (proto && proto instanceof Function) {
                return proto.call(ctor, this.sys);
              }else if (proto && typeof proto == 'object') {
                this.mixin(proto, ctor.prototype);
              }
              return ctor;
            },
            child: function(ctor, proto, attrs) {
              var klass = this.inherit(this.named(('$'+ctor.name).replace('$$', '$'), true, true), this.constructor);
              var $ctor = ctor instanceof Function ? ctor : this.named(ctor.name.toTypeName(), false, false, true);
              klass.$ctor = attrs && attrs.basetype ? ctor : (this.$code != '$ctor' ? this.inherit($ctor, this.$ctor, proto) : this.inherit($ctor, this.base, proto));
              return klass;
            },
            extend: function(ctor, proto, attrs) {
              var child, exists, klass;
              if (attrs && attrs.basetype) {
                child = ctor;
              }else {
                child = ctor instanceof Function ? ctor : (typeof ctor == 'string' ? { name: ctor } : 'Child');
              }
              exists = this.$store ? this.$store.get(child.name.toTypeCode()) : null;
              if (exists) return exists.get('type');
              klass  = this.child(child, proto, attrs);
              if (!klass.$ctor.prototype.__) klass.$ctor.prototype.__ = klass.$ctor;
              if (!klass.$ctor.prototype.kid) klass.$ctor.prototype.kid = this.kid;
              return new klass(klass.$ctor, attrs, this);
            },
            parse: function(def) {
              var type  = def instanceof Function ? def.call(this) : def;
              var ctor  = type.klass || type.ctor;
              var proto = type.ext instanceof Function ? type.ext.call(this.sys()) : type.ext;
              var attrs = type.attrs;
              var klass = this.extend(ctor, proto, type.basetype ? { basetype: true } : attrs);
              var extnd = type.extend ? this.find(type.extend).proto() : false;
              if (extnd) {
                Object.keys(extnd).reduce(function(r, k) {
                  if (!r[k]) r[k] = extnd[k];
                  return r;
                }, klass.proto());
              }
              if (type.init) type.init.call(this, type, klass, this.sys());
              return klass;
            },
            $parent: function() {
              var args = [].slice.call(arguments);
              return this.ctor.parent().prop(args.shift()).apply(this, args);
            },
            $super: function() {
              var level = this.__level__ || 0, parent = this.ctor;
              if (level++ < this.ctor._level) {
                while (level--) {
                  parent = parent.parent();
                }
                this.__level__ = this.ctor._level - parent._level;
                if (this.__level__) {
                  parent.$ctor.apply(this, arguments);
                }
              }
            },
            $prop: function() {
              var cache = {}, base = this.find('Obj').of([].slice.call(arguments).shift());
              return this.prop('prop', function prop(name) {
                return (cache[name] || (cache[name] = base[name](this.$ctor)));
              });
            },
            $overload: function(klass) {
              var ctor = this.$ctor = this.prop('constructor', Object.keys(this.$ctor).reduce(function(r, k) {
                r.$ctor[k] = r.$old[k];
                return r;
              }, { $ctor: this.inherit(klass, this.$ctor), $old: this.$ctor }).$ctor);

              return this;
            },
            $ready: function(comp) {
              if (typeof this._ready === 'number') {
                this.enqueue(function() {
                  comp.state('ready', sys.now());
                  return true;
                });
              }else {
                this._ready || (this._ready = []);
                this._ready.push(comp);
              }
              return comp;
            },
            $flush: function() {
              var now = sys.now();
              if (this._ready) {
                while (this._ready.length) {
                  this._ready.shift().state('ready', now);
                }
                this._ready = now;
              }else {
                this._ready = now;
              }
              return this;
            },
            find: function() {
              var args = [].slice.call(arguments).join('.').split('.');
              var name = args.shift().toTypeCode();
              var path = args.length ? args.join('.') : '';
              if (name == '$ctor') {
                var res = this.root();
                if (path) res = res.$store.get(path);
              }else {
                var uid = this.$index.get(name);
                var res = uid ? this.$index.find(uid, true) : null;
                if (res && path) res = path === path.toLowerCase() ? res.get(path) : res.get(path.toTypeCode());
                else if (res) res = res.get('type');
              }
              return res;
            },
            get: function(prop) {
              return !prop ? this.$store : (prop.substr(0, 4) == 'root' ? this.$store.root.get(prop.substr(5)) : this.$store.get(prop));
            },
            set: function(prop, value) {
              return this.$store.set(prop, value);
            },
            lookup: function() {
              var args = [].slice.call(arguments).flat();
              return args.length ? this.$store.lookup(args.join('.')) : this.$store.maybe();
            },
            proto: function(name) {
              var $ctor = name ? this.find(name, 'type.$ctor') : this.$ctor;//this.get('type.$ctor');
              if ($ctor) return $ctor.prototype;
            },
            ext: function(ext) {
              return this.mixin(ext, this.$ctor.prototype);
            },
            attr: function(name, value) {
              return value || value === '' ? (this.constructor.prototype[name] = value) : this.constructor.prototype[name];
            },
            prop: function(name, value) {
              return value || value === '' ? (this.$ctor.prototype[name] = value) : this.$ctor.prototype[name];
            },
            fromConstructor: function() {
              var args = [].slice.call(arguments);
              return args.length > 1 ? this.$ctor[args.shift()].apply(this.$ctor, args) : this.$ctor[args.shift()].bind(this.$ctor);
            },
            item: function(name) {
              var args = [].slice.call(arguments).join('.').split('.');
              if (args.length < 2 && args[0]) return this.get('items', args.first()) || this.find(args.first(), 'items.' + args.first().toRegular());
              else if (args.length < 3 && args.insert(1, 'items')) return this.find(args.join('.'));
              else if (args.length) return this.find(args.shift()).item(args.join('.'));
            },
            type: function(name, fn) {
              var type = this.get(name);
              return type ? (fn ? type[fn] : type) : unit;
            },
            test: function(ctor) {
              if (!ctor) return false;
              else if (!ctor.prototype) return this.test(ctor.constructor);
              return ctor.prototype && ctor.prototype.__ === this.$ctor.prototype.__ ? true : false;
            },
            ap: function(x) {
              return x.map ? x.map(this.bind(function(comp, fn) {
                return fn(comp);
              })) : (x instanceof Function ? this.maybe().lift(x) : this.maybe().lift(this.bind(function(c, x, f) {
                return f(x, c);
              })));
            },
            to: function(type, fn) {
              return this.map(this.ctor.find(type).pure);
            },
            walk: function(f) {
              var ctor = this;
              while (ctor) {
                if (f(ctor) === true) break;
                else ctor = ctor.parent();
              }
              return ctor;
            }
          };
        }),
        (function(set, makeWithPrefix, makeWithoutPrefix) {
          return set(function(prefix, start) {
            return prefix === false ? makeWithoutPrefix({ start: start || 1000000, id: start || 1000000 })
              : makeWithPrefix({ prefix: prefix, start: start || 1000000, id: start || 1000000 });
          });
        })(
          (function set(makeID) {
            return function() {
              this.prototype.makeID = makeID;
              this.prototype.id = makeID('CT');
              this.prototype.base.prototype.kid = makeID('', 100000);
              return this;
            }
          }),
          (function MakeID(counter) {
            return function() {
              return (counter.prefix + counter.id++);
            }
          }),
          (function MakeID(counter) {
            return function() {
              return counter.id++;
            }
          })
        ),
        (function(ctor, mixin, inherit) {
          ctor.prototype = { constructor: ctor, mixin: mixin, inherit: inherit };
          return new ctor;
        })(
          (function Extend() {}),
          (function(items, target, values) {
            if (!(items instanceof Array && typeof items == 'object'))
              return this.mixin(Object.keys(items), target, items)

            return items.reduce(function(r, v) {
              if (values && values[v]) {
                r[v] = typeof values[v] == 'object' && values[v].value ? values[v].value : values[v];
              }else {
                r[v.name] = typeof v == 'object' && v.value ? v.value : v;
              }
              return r;
            }, target);
          }),
          (function(ctor, parent, props) {
            var F = function() {};
            F.prototype = parent.prototype;
            var proto = new F(), keys = Object.keys(ctor.prototype);
            if (props) this.mixin(props, proto);
            if (keys.length && ctor.prototype.constructor == ctor) {
              ctor.prototype = keys.reduce(function(r, k, i, o) {
                r[k] = ctor.prototype[k];
                return r;
              }, proto);
            }else {
              proto.constructor = ctor;
              ctor.prototype = proto;
            }
            return ctor;
          })
        ),
        (function() {

          return [].slice.call(arguments).apply();
        })(
          (function(build, make, result, wrap) {
            return function() {
              this.prototype.named = wrap(build(make), result);
              return this;
            }
          }),
          (function(pure) {
            var args = [];
            var next = (function(f) { return f(args.shift()); });

            var tmpl = [ 
              pure('(function Make'), next, pure('() {'),
                pure('return function '), next, pure('() {'),
                  pure(' this._id = this.id();'),
                  pure(' this.ctor.apply(this, arguments);'),
                  pure(' this.$super.apply(this, arguments);'),// this.__level__ && !(this.__level__ = 0);'),
                  pure(''),//this.__super__.apply(this, arguments);'),
                  pure(''),//return this;'),
                pure('}})();') ];

            return function(k) {
              return k(args, next, tmpl);
            }
          })(function(t) { return function(f) { return f(t); }}),
          (function(args, next, tmpl) {
            return function named(name, id, ctor, level, superr) {
              args.push(name, name);
              return tmpl.filter(function(v, i) {
                return i < 6 || (i == 6 && id) || (i == 7 && ctor) || (i == 8 && level) || (i == 9 && superr) || i > 9;
              }).map(this.extract(unit)).join('');
            }
          }),
          (function(text) {
            try {
              return eval(text);
            }catch(e) {

            }
          }),
          (function(make, result) {
            return function named() {
              return result(make.apply(this.sys().fn, [].slice.call(arguments)));
            }
          })
        ),
        (function() {
          this.prototype = {
            klass: function(name) {
              return this.ctor.find(name);
            }
          };
          return this;
        }).call((function Base() {}))
      ),
    // === DB === //
      (function() {
        return {
          klass: function DB() {
            this._base   = this._uid = this.root.base;
            this._id     = this._uid;
            this._ref    = this.root.val;
            this._loc    = [];
            this._cache  = {};
            this._stock  = [];
            this._locked = [];
          },
          ext: [
            (function root() {
              return { name: 'root', base: 1000000, val: [] };
            })(),
            (function $locate(nid, loc) {
              var uid = nid - this._base;
              var idx = 0, lvl = 0, div = 1000, val = this._ref;
              while (val && ++idx < 4) {
                lvl = uid < div ? 0 : ((uid - uid%div) / div);
                uid = uid - (div * lvl); div = div / 10;
                while (val.length <= lvl) { val.push([]); }
                if (loc) loc.push(lvl);
                val = val[lvl];
              }
              return loc || val;
            }),
            (function $load(loc) {
              return this._ref[loc[0]][loc[1]][loc[2]];
            }),
            (function locate(nid, loc) {
              return (this._val = this.$locate(nid, loc));
            }),
            (function check(nid) {
              return (!nid || nid < this._base || nid >= this._uid) ? false : true;
            }),
            (function find(nid, full) {
              if (!this.check(nid)) return;
              var val = this._cache[nid] ? this.$load(this._cache[nid]) : this.$locate(nid);
              return val ? (full ? val[nid%10] : val[nid%10][1]) : null;
            }),
            (function cached(nid, full) {
              if (!this.check(nid)) return;
              var val = this.$load(this._cache[nid] || (this._cache[nid] = this.$locate(nid, [])));
              return val ? (full ? val[nid%10] : val[nid%10][1]) : null; 
            }),
            (function retrieve(nid, cached) {
              return cached ? this.cached(nid) : this.find(nid);
            }),
            (function push(val, item, ref) {
              return val[(val.push((this._loc = [ ref || [ [], [], {} ], item ]))-1)][0];
            }),
            (function uid(loc) {
              var uid = 0, val;
              while (loc.length) {
                uid+=Math.pow(10,loc.length)*loc.shift();
              }
              return this._base+uid;
            }),
            (function add(item, ref) {
              if (ref && (ref = this.$locate(ref).at(ref%10))) {
                if (this._uid%10==0) this._val = null;
                item._uid = this._uid++;
                return this.push(this._val || (this._val = this.locate(this._uid)), item, ref[0]);                
              }else if (this._stock.length) {
                var loc   = this._stock.pop();
                var exist = this.$load(loc).at(loc.pop());
                item._uid = exist.pop().uid();
                return exist[0*exist.push(item)];
              }else {
                if (this._uid%10==0) this._val = null;
                item._uid = this._uid++;
                return this.push(this._val || (this._val = this.locate(this._uid)), item);
              }
            }),
            (function restore(item) {
              var uid = item._uid || item;
              var loc = this._locked.findIndex((a) => {
                return a.reduce((r, x, i) => {
                  r += (x * Math.pow(10, 3 - i));
                  return r;
                }, 0) === uid;
              });
              if (loc >= 0) {
                this._locked.splice(loc, 1);
              }
              return this.find(uid);
            }),
            (function clear(item) {
              if (item._locked) {
                this._locked[(this._locked.push(this.$locate(item._uid, []))-1)].push(item._uid%10);
              }else {
                this._stock[(this._stock.push(this.$locate(item._uid, []))-1)].push(item._uid%10);
              }
              return this;
            })
          ],
          attrs: [
            (function of() {
              return new this();
            })
          ],
          add: function(root) {
            return function(store, ref) {
              return root.add(store, ref);
            };
          },
          make: function(klass) {
            return function(root, data) {
              return (klass.$ctor.prototype.$data = data(unit(klass.$ctor.prototype.db = root)));
            }
          },
          data: function(db, add, make) {
            return (db.constructor.prototype.$data = function(klass) {
              return make(klass)(new db.$ctor(), add);
            });
          },
          init: function(type, klass, sys) {
            this.$data = type.data(klass, type.add, type.make);
          }
        };
      }),
    // === Store === //
      (function() {
        return {
          klass: function Store(ref, name, uid) {
            this._all = this.$data(this, uid);
            this._val = this._all[0];
            this._ids = this._all[1];
            this._map = this._all[2];
            this._cid = name || 'root';

            if (ref) this._ref = this.is(ref.parent) ? ref.parent : ref;
          },
          ext: [
            (function cid() {
              return this._ref ? this._ref.cid() : this._cid;
            }),
            (function uid() {
              return this._uid;
            }),
            (function nid() {
              return this.prefix+this._uid;
            }),
            (function of(ref, ctor, name) {
              return ctor ? new ctor(ref, name) : new this.constructor(ref, name);
            }),
            (function is(value) {
              return value && value instanceof this.__;
            }),
            (function identifier(asArray, recalc) {
              return this._ref && this._cid == this._ref._cid ? this._ref.identifier(asArray, recalc) : this._identifier(asArray, recalc);
            }),
            (function level() {
              return (this._ref && this._ref._level) || 0;
            }),
            (function store() {
              return this;
            }),
            (function lock() {
              this._locked = true;
            }),
            (function unlock() {
              this._locked = false;
            }),
            (function index(key) {
              return this._map[key];
            }),
            (function ids() {
              return this._ids;
            }),
            (function keys(index) {
              return typeof index == 'number' ? this._ids[index] : this._ids.slice(0);
            }),
            (function vals() {
              return this._val;
            }),
            (function get(key) {
              if (!key && typeof key == 'undefined') return this._ref;
              else if (key && typeof key == 'string' && this._map[key]>=0) return key.substr(0, 1) === '*' ? this.read(key) : this._val[this._map[key]];
              else if (key && typeof key == 'string' && key.indexOf('.')>=0) return this.path(key);
              else return typeof key == 'string' && (key || this._map[key]>=0) ? this._val[this._map[key]] : this._ref;
            }),
            (function val(key, value) {
              return key && typeof key == 'string' && this.has(key) ? (value ? (this._val[this._map[key]] = value) : this._val[this._map[key]]) : (value ? this.set(key, value) : this.get(key));
            }),
            (function read(key) {
              return this.find(this._val[this._map[key]]);
            }),
            (function initial(key) {
              var ref = this;
              while (ref && ref instanceof this.constructor) {
                ref = ref._ref;
              }
              return key ? ref.get(key) : ref.get();
            }),
            (function current() {
              return this.get(this.get('key')||'vals');
            }),
            (function apply(fn, ctx) { // args
              if (typeof fn == 'string') {
                var target = this.get(fn);
                var args   = Array.prototype.slice.call(arguments, 1);
                if (target instanceof Function) return target.apply(ctx || this, args);
              }else if (fn instanceof Function) {
                var args   = Array.prototype.slice.call(arguments, 1);
                return fn.apply(ctx || this, args);
              }
            }),
            (function parent(key) {
              return this._ref && !(this._ref instanceof this.__) ? this._ref.parent(key) : (key ? this._ref.get(key) : this._ref);
            }),
            (function key(index, raw) {
              var key = this._ids[index];
              return key && typeof key === 'string' && !raw ? key.replace('*', '') : key;
            }),
            (function at(index) {
              return this._val.length && index < this._val.length ? this.get(this.keys(index)) : null;
            }),
            (function first() {
              return this._val.length && this.get(this.keys(0));
            }),
            (function last() {
              return this._val.length && this.at(this._val.length - 1);
            }),
            (function has(key) {
              return this.index(key) >= 0 ? true : false;
            }),
            (function set(key, value) {
              return (this._val[(this._map[key] >= 0 ? this._map[key] : (this._map[key] = (this._ids.push(key)-1)))] = value);
            }),
            (function push(key, value) {
              return arguments.length > 1 ? ((this.get(key) || this.set(key, [])).push(value)) : this.push('vals', key);
            }),
            (function add(name, ref, uid) {
              return this.set(name, this.is(ref) ? ref : this.constructor.of(ref || this, name, uid));
            }),
            (function child(name, ctor, ref) {
              var opts = typeof name == 'object' ? name : {};
              if (typeof name == 'string') opts.name = name;
              else if (name && name.name) opts.name = name.name;

              return this.get(opts.name) || this.set(opts.name, this.of(this, ctor, name));
            }),
            (function node(name, ref) {
              return this.child(name, this.__, ref);
            }),
            (function ensure() {
              var path = [].slice.call(arguments).flat().join('.').split('.');
              var node = this, test = node, key;
              while (node && path.length && (key = path.shift())) {
                if ((test = node.get(key))) node = test;
                else node = node.child(key);
              }
              return node;
            }),
            (function ref(value) {
              return value ? (this._ref = value) : this._ref;
            }),
            (function length() {
              return this._val.length;
            }),
            (function clear(id) {
              var node = this, vals;
              if (!node || !node.length || !node.length()) {
                return {};
              }else if (!id) {
                vals = node.reduce(function(r, v, k, n, i) {
                  if (node.is(v)) {
                    if (node.key(i) === node.key(i, true)) {
                      r[k] = v.clear();
                      v.db.clear(v);
                    }else {
                      r[k] = node.key(i, true);
                    }
                  }else {
                    r[k] = v;
                  }
                  return r;
                }, {});

                node._map = node._all[2] = {};
                node._ids.splice(0);
                node._val.splice(0);
                return vals;
              }else {
                var idx = node._map[id],
                keys = node._ids.splice(0),
                idxs = keys.map(k => node._map[k]),
                val  = [].concat(node._val.splice(0)),
                pos  = 0,
                del  = [],
                tmp;

                node._map = node._all[2] = {};
                while(pos < val.length) {
                  if (id != keys[pos]) {
                    tmp = val[idxs[pos]];
                    if (tmp.isStore) node.add(keys[pos], tmp);
                    else node.set(keys[pos], tmp);
                  }else {
                    del.push([ keys[pos], val[idxs[pos]] ]);
                  }
                  pos++;
                }
                return del.reduce(function(r, v, i) {
                  r[v[0]] = v[1].isStore ? v[1].values(true) : v[1];

                  return r;
                }, {});
              }
            }),
            (function lookup(key, orElse) {
              return this.maybe().map(function(store) {
                return key ? (store.get(key)||(orElse && orElse instanceof Function ? orElse(store) : orElse)) : orElse;
              });
            }),
            (function children() {
              return this._ref && !(this._ref instanceof this.__) ? this._ref._children : '';
            }),
            (function base() {
              return this._ref && !(this._ref instanceof this.__) ? this._ref.base() : {};
            }),
            (function(wrap, run) {
              return wrap(run);
            })(
              (function(run) {
                return function values(recur, children, nodes) {
                  return run(children, nodes)([], this, recur);
                }
              }),
              (function(children, nodes) {
                return function $values(stack, node, recur) {
                  return node._val.reduce(function $reduce(result, value, index) {
                    var key = node._ids[index], uid;
                    if (node.is(value) && (uid = value.uid())) {
                      if (stack.indexOf(uid) >= 0) {
                        result[key] = `[RECUR:${uid}]`;
                      }else if (stack.push(uid) && value.get('$$skip')) {
                        // auxiliary node
                      }else if (!children && node.children() == key) {
                        value.reduce(function(r, v, k, i) {
                          if (k === key) {
                            // SKIP!
                          }else if (node.is(v)) {
                            if (nodes && ('' + parseInt(k)) !== k && v.cid().indexOf('*') !== 0) {
                              result[key] || (result[key] = []);
                              result[key].push(k);
                            }
                            r[k] = $values(stack.slice(0), v, recur);
                          }else r[k] = v;
                          return r;
                        }, result);
                      }else {
                        result[key] = recur ? $values(stack.slice(0), value, typeof recur == 'number' ? (recur - 1) : recur) : value;
                      }
                    }else if (key && key.indexOf('*') === 0) {
                      result[value] = node.ref().values(recur, children, nodes);
                    //   node.ref().values().lift(function(vals, code) {
                    //     result[vals[code]] = vals;
                    //   }).ap(node.get(key.slice(1)));
                    }else {
                      result[key] = value;
                    }
                    return result;
                  }, node.base());
                }
              })
            ),
            (function convert() {
              return this.parse.apply(this, [].slice.call(arguments));
            }),
            (function each(f) {
              var store = this;
              this._val.forEach(function(v, i) {
                f(v,store._ids[i],i,store);
              });                            
            }),
            (function map(f) {
              var arr = [], store = this;
              this._val.forEach(function(v, i) {
                arr.push(f(v,store._ids[i],i,store));
              });
              return arr;
            }),
            (function filter(f) {
              var arr = [], store = this;
              this._ids.forEach(function(k, i) {
                let v = store.get(k);
                if (f(v,store.key(i),i,store)) {
                  arr.push(v);
                }
              });
              return arr;
            }),
            (function reduce(f, r) {
              return this._ids.reduce(function(r, k, i) {
                r.res = f(r.res, r.node.get(k), typeof k === 'string' ? k.replace('*', '') : k, r.node, i);
                return r;
              }, { res: r || {}, node: this }).res;
            }),
            (function $bind(b) {
              return function bind(f, r, p) {
                return this.map(function(v, k, o) {
                  return v instanceof Array ? v.arr() : v;
                }).bind(b(f, r || {}, this), p);
              }
            })(
              (function bind(f, x, s, y) {
                return function $fn(v, i, o) {
                  var k = y || (s && s.keys ? s.keys(i) : v.name);
                  var r = k.indexOf('*') === 0 ? sys.find(v.uid || v) : v;
                  if (s && s.is && s.is(v) && v._val.length) return v.bind(f, (x[k] = {}));
                  else if (v && v.name == '$_arr') return v().bind(bind(f, (x[k] = {}), s, k));
                  return (x[k] = f(v, k, i, s && s._ref ? (s._cid == s._ref._cid ? s.ref() : s) : o) || v);
                };
              })
            ),
            (function find(value, cached) {
              var val = ('' + (typeof value == 'object' ? (value._uid || value._id || value.uid) : value)).split('.');
              var uid = val.shift();
              var res = uid ? this.db.retrieve(uid, cached) : null;
              return val.length && res ? res.get(val.join('.')) : res;
            }),
            (function info(/* recur, msg, opts */) {
              var args  = [].slice.call(arguments);
              var recur = (args.length && typeof args[0] == 'boolean' ? args.shift() :
                    (args.length && typeof args[args.length-1] == 'boolean' ? args.pop() : false));
              var msg   = (args.length && typeof args[0] == 'string' ? args.shift() : '');
              var opts  = (args.length && typeof args[0] == 'object' ? args.shift() : {});
              var count = 0, bind = this.bind(function(x, k, i, o) {
                var info = msg ? [ msg ] : [];
                if (o && o.is) {
                  info.push(o.identifier(), k, x, i, o.uid(), o.store().is(x) ? 'store' : o.is(x) ? 'node' : 'value', count);
                }else {
                  info.push(x, o, i, count);
                }
                if (opts.log === true) console.log(info);
                count++;
                return info.arr();
              }, opts);
              return recur ? bind.bind(unit, opts) : bind;
            }),
            (function object(k) {
              return { '$$': true, value: this.get(k), key: k, index: this.index(k), ref: this.identifier(), object: this, level: this.level() };
            }),
            (function(test, run, expr) {
              return function search(str, recur) {
                return this.vals().select(test(expr(str)), run(recur));
              }
            })(
              (function(expr) {
                return function(x) {
                  if (!x) return false;
                  else if ((typeof x == 'string' && expr.test(x))
                    || (x.key && typeof x.key == 'string' && expr.test(x.key))
                    || (x.ref && typeof x.ref == 'string' && (expr.test(x.ref) || expr.test(x.ref.concat('.', x.key))))) {
                    return true;
                  }
                }
              }),
              (function(recur) {
                return function(x) {
                  var o = x && x['$$'] ? x.value : x;
                  return o && o.isStore && o.vals && o.length() ? (recur ? o.map(function(v, k, i, o) {
                    return k ? o.object(k) : {};
                  }) : o.parent().object(o.cid())) : x;
                }
              }),
              (function(str) {
                return (str.match(/[%$]/) ? str : ('%' + str + '%')).replace(/%{2,}/g, '%').$like();
              })
            ),
            (function walk(run) {
              return function walk(key, callback) {
                return run(typeof key == 'string' ? key.split('.') : key.slice(0), callback)(this);
              }
            })(
              (function walk(parts, callback) {
                return function next(node) {
                  var key = parts.first() == 'parent' ? parts.first() : parts.shift();
                  var val = key == 'parent' ? node.parent() : node.get(key);
                  if (val) {
                    if (callback(val, key, node)) {
                      return val;
                    }else {
                      return val && node.is(val) && parts.length ? next(val) : null;
                    }
                  };
                }
              })
            )
          ],
          attrs: [
            (function of(ref, name, uid) {
              return new this(ref, name, uid instanceof this ? uid._uid : uid);
            })
          ],
          find: function() {
            return this.ctor.find.apply(this.ctor, [].slice.call(arguments));
          },
          init: function(type, klass, sys) {
            klass.$ctor.prototype.isStore = true;
            klass.$ctor.prototype.$data = this.$data(klass);//type.make(klass));
            sys.root  = klass.$ctor.prototype.root = unit(new klass.$ctor());
            sys.klass = type.find;
            var store = this.constructor.prototype.$store = sys.root.child('types');
            var index = this.constructor.prototype.$index = store.child('index');
          }
        };
      }),
    // === Parse === //
      (function() {

        return [].slice.call(arguments).flat().apply();
      })(
        // === Create parse & import combined === //
          (function(parseArgs, getArgs, makeArgs, importFuncs) {
            return function(utils) {
              utils.set('parseArgs', parseArgs);
              utils.set('getArgs', getArgs);
              utils.set('makeArgs', makeArgs);
              utils.set('importFuncs', importFuncs.bind(utils));
              return utils;
            }
          }),
        // === Find $_ values === //
          (function() {
            var args = [].slice.call(arguments);
            return args.slice(1).prepend(args.apply());
          })(
            (function $_parseArgs(getArgs, makeArgs) {
              return function parseArgs(f, r, i) {
                if (f.name.substr(0, 2) == '$_') {
                  return makeArgs(f, getArgs(f), r, i);
                }else {
                  return f;
                }
              }
            }),
            (function getArgs(func) {
              // Courtesy: https://davidwalsh.name/javascript-arguments
              var args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];
              return args.split(',').map(function(arg) {
                return arg.replace(/\/\*.*\*\//, '').trim();
              }).filter(function(arg) { return arg; });
            }),
            (function makeArgs(func, args, source, isStore) {
              return func.apply(source, args.map(function(a, i, r) {
                return isStore ? source.get(a.replace('$_', '')) : source[a.replace('$_', '')];
              }));
            })
          ),
        // === Determine $_ args === //
          (function importFuncs(items, target, values) {
            if (!(items instanceof Array) && typeof items == 'object') return importFuncs(Object.keys(items), target, items);
            var isStore   = target.isStore && target.set && target.get ? true : false;
            var parseArgs = this.get('parseArgs');
            return items.reduce(function(r, v) {
              var func = values ? values[v] : (v.fn ? v.fn : v);
              var name = values ? (v.name || v) : v.name;
              var val  = name.substr(0, 2) == '$_' ? parseArgs(func, r, isStore) : func;
              if (isStore) {
                r.set(name.replace('$_', ''), val);
              }else {
                r[name.replace('$_', '')] = val;
              }
              return r;
            }, target);
          })
      ),
    // === Utils === //
      (function() {

        return [].slice.call(arguments).pure(0, true);
      })(
        // === import / parse === //
          (function(items) {
            return function(sys, utils) {
              utils.set('$const', sys.fn.$const);
              utils.set('curry', sys.fn.curry);
              utils.set('point', items.shift().call({ curry: sys.fn.curry }));
              utils.set('get', items.shift()(utils.get('importFuncs')(items, utils).get('path')));
              utils.ctor.base.prototype.bin = utils.get('pass')(utils.get('bind'));
              utils.ctor.mixin([
                { name: 'fn',     value: utils.get('func')   },
                { name: 'select', value: utils.get('pass')(utils.get('select')) },
                { name: 'parse',  value: utils.get('parse')  }
              ], utils.constructor.prototype);

              return utils;
            }
          }),
          (function() {
            // map :: Monad m => (a -> b) -> m a -> m b
            this.map = this.curry(function(fn, m) {
              return m.map(fn);
            });

            // chain :: Monad m => (a -> m b) -> m a -> m b
            this.chain = this.curry(function(fn, m) {
              return m.chain(fn);
            });

            // ap :: Monad m => m (a -> b) -> m a -> m b
            this.ap = this.curry(function(mf, m) { // mf, not fn, because this is a wrapped function
              return mf.ap(m);
            });

            // orElse :: Monad m => m a -> a -> m a
            this.orElse = this.curry(function(val, m) {
              return m.orElse(val);
            });

            this.lift = this.curry(function(f, m) {
              return m.lift(f);
            });

            this.lift2 = this.curry(function(f, m1, m2) {
              debugger;
              return m1.map(f).ap(m2);
            });

            this.lift2M = function(f, t1, t2) {
              return this.curry(function(v1, v2) {
                return (t1 ? t1(v1) : v1).map(f).ap(t2 ? t2(v2) : (t1 ? t1(v2) : v2));
              }, this);
            };

            return this;
          }),
          (function get(make) {
            return function(path) {
              return function(obj) {
                return make.bind({ fn: path.bind(obj) });
              }
            }
          })(
            (function() {
              var args = [].slice.call(arguments);
              return this.fn(args.length ? args.join('.') : undefined);
            })
          ),
        // === call and pass === //
          (function call(f) {
            return function() {
              return f(this);
            }
          }),
          (function atom(f, g) {
            return function() {
              return f(g(this));
            }
          }),
          (function call1(f) {
            return function(x) {
              return f(this, x);
            }
          }),
          (function call2(f) {
            return function(x, y) {
              return f(this, x, y);
            }
          }),
          (function pass(f) {
            return function() {
              return f(this).apply(undefined, arguments);
            }
          }),
          (function apply(f) {
            return function() {
              return f.apply(this, arguments);
            }
          }),
          (function _1(f) {
            return function(t) {
              return f(t);
            };
          }),
          (function $true(f) {
            return function (t) {
              return f;
            };
          }),
          (function $false(f) {
            return function (t) {
              return t;
            };
          }),
          (function maybe(m) {
            return function(l) {
              return function(r) {
                return m(l)(r);
              }
            }
          }),
          (function right(x) {
            return function (l) {
              return function (r) {
                return r(x);
              };
            };
          }),
          (function apply(f) {
            return function (x) {
              return f(x);
            };
          }),
          (function fst(t) {
            return t($true);
          }),
          (function snd(t) {
            return t($false);
          }),
          (function left(x) {
            return function(l) {
              return function(r) {
                return l(x);
              }
            }
          }),
          (function tuple(a) {
            return function(b) {
              return function(f) {
                return f(a)(b);
              }
            }
          }),
          (function bin(f) {
            return function(x) {
              return function(y) {
                return f(x, y);
              }
            }
          }),
          (function bind(a) {
            return function(f) {
              return function(b) {
                return f(a, b);
              }
            }
          }),
          (function compose(f) {
            return function(g) {
              return function(a) {
                return g(f(a));
              }
            };
          }),
          (function andThen(g) {
            return function(f) {
              return function(a) {
                return g(f(a));
              }
            };
          }),
          (function flip(f) {
            return function(a, b) {
              return f(b, a);
            }
          }),
          (function y(r) {
            return (function (f) {
              return f(f);
            })(function (f) {
              return r(function (x) {
                return f(f)(x);
              });
            });
          }),
        // === ext/prop/tar/_1/maybe/tup etc etc === //
          (function extend(target, source) {
            var hasOwnProperty = Object.prototype.hasOwnProperty;
            source || (source = this);
            target || (target = {});
            for (var propName in source) {
              if (hasOwnProperty.call(source, propName)) {
                target[propName] = source[propName];
              }
            }
            return target;
          }),
          (function update(target, source) {
            var hasOwnProperty = Object.prototype.hasOwnProperty;
            source || (source = this);
            target || (target = {});
            for (var propName in source) {
              if (hasOwnProperty.call(target, propName)) continue;
              else if (!hasOwnProperty.call(source, propName)) continue;
              else target[propName] = source[propName];
            }
            return target;
          }),
          (function property(fn) {
            return function() {
              var args = Array.prototype.slice.call(arguments);
              return function(obj) {
              return !obj || !fn ? null :
                (fn instanceof Function ? fn.apply(obj, args) :
                (obj && obj[fn] && obj[fn].apply ? obj[fn].apply(obj, args) : obj[fn]));
              };
            };
          }),
          (function target(obj) {
            return function(fn) {
              return function() {
              var args = Array.prototype.slice.call(arguments);
              return !obj ? null : (!fn ? obj :
                (fn instanceof Function ? fn.apply(obj, args) :
                (obj && obj[fn] && obj[fn].apply ? obj[fn].apply(obj, args) : null)));
              };
            };
          }),
          (function fn(x) {
            return x && x instanceof Function ? x() : x;
          }),
          (function path(key, value) {
            return !key ? this : key.split('.').reduce(function(result, key, idx, keys) {
              if (!key || !result) {
                return result;
              }else if (!idx && result instanceof Function) {
                result = null;
              }else if (!idx && key == 'root' && result.isStore) {
                result = result.root || result;
              }else if ((value || typeof value != 'undefined') && (idx == keys.length - 1)) {
                result = result.set ? result.set(key, value) : (result[key] = value);
              }else if (idx && (keys[idx-1] == 'fn' || keys[idx-1] == '$fn')  && result[key] instanceof Function) {
                result = keys[idx-1] == '$fn' ? (result.isStore ? (result.get(key) || result[key].bind(result)) : result[key]) : result[key]();
              }else if (result.isStore && key == '$fn' && result.get(key)) {
                result = result.get(key);
              }else if ((key == 'fn' || key == '$fn') && result[keys[idx+1]] instanceof Function) {
                result = result;
              }else if (result.isStore) {
                if (key.substr(0, 1) == '*') {
                  if (result.ref()) result = result.ref().get(key);
                  else if ((key = result.get(key))) result = result.find(key.uid || key);
                }else {
                  if (key.substr(0, 1) == '%') key = result.get(key.slice(1));
                  if (key && result.has(key)) result = result.get(key);
                  else if (key) result = result.get(key) || (result.ref() && result.ref().get(key)) || (value ? result.child(key) : ((keys.length - idx) > 1 || key.substr(0, 1) == '$' ? null : null));//result[key]));
                  else result = null;
                }
              }else if (result instanceof Array) {
                result = result.at(parseInt(key || 0) || 0);
              }else if (typeof result == 'object') {
                if (key == '$fn') key = 'fn';
                if (false && result && result.get) result = result.get(key) || result[key] || result[key.replace('-', '.')];
                else result = result[key] || result[key.replace('-', '.')];
              }
              return result;
            }, this);
          }),
        // === objPath, isBaseType, toString === //
          (function identifier(key) {
            function calcOnce(node) {
              var path = [], parent = node;
              while ((parent = parent.parent())) {
                path.unshift(parent._cid);
              };
              path.push(node._cid);
              if (node._cache) return (node._cache.identifier = path.slice(node._offset));
              return path.slice(node._offset);
            };
            return function identifier(asArray, reCalc) {
              var path = this._cache && this._cache.identifier && !reCalc ? this._cache.identifier : calcOnce(this);
              return asArray === true ? path : path.join(typeof asArray == 'string' ? asArray : '.');
            };
          }),
          (function objPath(name, target, value) {
            var parts = name.split('.');
            var curr  = target || self;
            for (var part; parts.length && (part = parts.shift());) {
              if (!parts.length && value !== undefined) {
                curr[part] = value;
              } else if (part in curr) {
                curr = curr[part];
              } else if (parts.length && value !== undefined) {
                curr = curr[part] = {};
              } else {
                curr = null;
                break;
              }
            }
            return curr;
          }),
          (function isBaseType(value) {
            if (!value || sys.run().is(value)) return false;
            else if (typeof value == 'object') return (value.constructor === Object);
            else if (value instanceof Function) return !value.klass || value === Function || value === Object;
            return false;
          }),
          (function clone(o) {
            if (o && typeof o == 'object' && o.constructor == Object) {
              var r = {}; for (var key in o) {
                if (o.hasOwnProperty(key)) {
                  r[key] = clone(o[key]);
                }
              }
              return r;
            }else if (o && o instanceof Array) {
              return o.map && o.map(function(v) { return clone(v); });
            }
            return o;
          }),
        // === $map, $filter, $comprehension
          (function $map(stream, f) {
            return function(continuation) {
              return stream(function(value) {
                continuation(f(value));
              });
            };
          }),
          (function $filter(stream, f) {
            return function(continuation) {
              return stream(function(value) {
                if (f(value)) {
                  continuation(value);
                }
              });
            };
          }),
          (function $_comprehension($_$map, $_$filter) {
            return function comprehension(f_map, f_filter) {
              return function(stream) {
                stream = $_$map(stream, f_map);
                if (f_filter) {
                  stream = $_$filter(stream, f_filter);
                }
                return stream;
              };
            };
          }),
        // === keys, values, object, assign, select etc etc === //
          (function(nativeKeys, nativeHas) {
            return function keys(obj) {
              if (typeof obj != 'object') return [];
              if (obj instanceof Array) return obj.map(function(v, i) {
                return v && v.name ? v.name : i;
              });
              else if (obj instanceof Object || obj.constructor == Object) return nativeKeys(obj);
              else if (obj.keys && obj.keys instanceof Function) return obj.keys();
              else if (nativeKeys) return nativeKeys(obj);
              var keys = [];
              for (var key in obj) if (nativeHas.call(obj, key)) keys.push(key);
              if (hasEnumBug) collectNonEnumProps(obj, keys); // Ahem, IE < 9.
              return keys;
            };
          })(Object.keys, Object.hasOwnProperty),
          (function $_values($_keys) {
            return function values(obj, fn) {
              var kys = $_keys(obj),
              vals = [], usekeys = obj instanceof Array ? false : true,
              useget = usekeys && obj.get && obj.get instanceof Function,
              func = fn || unit;
              for (var i = 0; i < kys.length; i++) {
                vals.push(func(useget ? obj.get([kys[i]]) : (usekeys ? obj[kys[i]] : obj[i]), usekeys ? kys[i] : i));
              };
              return vals;
            }
          }),
          (function $_length($_keys) {
            return function length(item) {
              return item.length ?
                (item.length instanceof Function ? item.length() : item.length)
                  : (typeof item == 'object' ? $_keys(item) : 0);
            }
          }),
          (function $_object($_length, $_keys, $_values) {
            return function obj(map, base) {
              return function(values) {
                var result = base || {}, keys;
                if (!values && !this.document) values = this;
                if (!values && map instanceof Array) {
                  values = $_values(map); keys = $_keys(map);
                }else {
                  keys = map || $_keys(values);
                }
                for (var i = 0, len = $_length(keys); i < len; i++) {
                  if (!keys[i] && !values) continue;
                  else if (values) result[keys[i]] = values[i];
                  else result[keys[i][0]] = keys[i][1];
                }
                return result;
              };
            };
          }),
          (function $_assign($_objPath) {
            return function assign(obj) {
              obj || (obj = {});
              return function(val, key) {
                if (val == '*' && key == '*') return obj;
                else if (key && typeof val !== 'undefined') $_objPath(key, obj, val);
                else if (typeof val !== 'undefined') obj = val;
                return obj;
              };
            }
          }),
        // === parse, select, each === //
          (function(set, plain, lazy, run, wrap) {
            return function $_parse($_keys, $_values) {
              return wrap(run(plain(set, $_keys, $_values), lazy(set)));
            }
          })(
            (function set(run, node, key, value, recur, ctor) {
              if (value && typeof value == 'object' && key != 'args') {
                if (value instanceof Array && node._children) {
                  var trg = node.node(node._children).child(key, ctor || node.constructor);
                  value.map(function(v, i) {
                    trg.child(i+'').parse(v, recur);
                  });
                }else if (node.is(value)) {
                  node.set(value.cid(), value);                                   
                }else if (value && value.constructor != Object && value.constructor.name != 'Obj' && value instanceof sys.ctor.base) {
                  node.set(key, value);
                }else if (recur) {
                  run(node.child(key, ctor), value, typeof recur == 'number' ? (recur - 1) : recur, ctor);
                }else {
                  node.set(key, value, false);
                }
              }else if (typeof key == 'number' && value instanceof Array && value.length == 2 && typeof value[0] == 'string') {
                node.set(value[0], value[1]);
              }else {
                node.set(key, value === null ? '' : value, false);
              }
            }),
            (function(set, $_keys, $_values) {
              return function plain(node, data, recur, ctor) {
                var keyss = $_keys(data), valss = $_values(data), val, key;
                while (keyss.length) {
                  key = keyss.shift();
                  val = valss.shift();
                  set(plain, node, typeof key == 'string' ? key.toKey() : key, val, recur, ctor);
                }
                return node;
              };
            }),
            (function(set) {
              return function lazy(node, data, recur, ctor) {
                return data.keys().reduce(function(r, k) {
                  set(lazy, r, k, data[k], recur, ctor);
                  return r;
                }, node);
              };
            }),
            (function(plain, lazy) {
              return function run(node, data, recur, ctor) {
                return typeof data == 'object' && data.constructor.name == 'Obj'
                  ? lazy(node, data, recur, ctor === true ? node.__ : ctor) : plain(node, data, recur, ctor === true ? node.__ : ctor);
              };
            }),
            (function(run) {
              return function() {
                var args = [].slice.call(arguments);
                if (args.length < 3 && args[args.length-1] instanceof Function) {
                  return run(this, args.shift(), false, args.pop());
                }else {
                  args.unshift(this);
                  return run.apply(undefined, args);
                }
              }
            })
          ),
          (function $_select($_assign, $_keys) {
            return function select(obj) {
              return function select() {
                var test  = Array.prototype.slice.call(arguments),
                args  = test.length == 1 && test[0] instanceof Array ? test.shift() : test,
                cont  = args.length && args[args.length-1] instanceof Function || args[args.length-1] === true ? args.pop() : false,
                keyss = args.length == 0 ? $_keys(obj) : args.slice(0),
                base  = args.length && args[0] && typeof args[0] == 'object' && args[0].constructor == Object ? args.shift() : {},
                coll  = cont ? [] : $_assign(base);
                keyss.forEach(function(arg) {
                  var item = arg.split(' as ');
                  var path = item.shift();
                  var key  = item.length ? item : path.split('.'), part;
                  while (key.length && (part = key[key.length-1].substr(0, 1))) {
                  if (part == '*' || part == '!') key.pop();
                  else break;
                  }
                  if (key[0] == 'root' && key.shift()) path = key.slice(1).join('.');
                  if (cont) coll.push(obj.get ? obj.get(path) : obj[path]);
                    else coll(obj.get ? obj.get(path) : obj[path], key.join('.'));
                });
                return cont ? (cont === true ? coll : cont.apply(undefined, coll)) : coll();
              }
            }
          }),
          (function $_each($_keys, $_values) {
            return function each(x, f) {
              var isarr = x instanceof Array;
              var keyss = isarr ? x.slice(0) : (typeof x == 'object' ? Object.keys(x) : [ x ]), i = 0;
              while (i < keyss.length) {
                f(isarr ? keyss[i] : x[keyss[i]], isarr ? i : keyss[i], keyss);
                i++;
              }
            }
          }),
          (function(main, wrap, make) {
            return main(wrap(make));
          })(
            (function($fn) {
              return function func(key) {
                return key ? $fn(this)(key) : $fn(this);
              }
            }),
            (function($fn) {
              return function(node) {
                return function(key) {
                  return $fn(node, key);
                }
              }
            }),
            (function(node, key) {
              var name, path, test;
              if (key && key.indexOf && key.indexOf('.')>0) {
                path = key.split('.');
                name = path.pop();
                node = node.get(path);
              }else {
                name = key;
              }
              return node[name] && node[name] instanceof Function
                && (!node.isStore || node.constructor.prototype[name] instanceof Function)
                  ? node[name].bind(node) : null;
            })
          ),
          (function(fstchr, delim, wrap) {
            return function $_toString($_each, $_keys, $_isBaseType) {
              return wrap(fstchr, delim, $_each, $_keys, $_isBaseType);
            }
          })(
            new RegExp(/[^\s]/),
            String.fromCharCode(10),
            (function wrap(fstchr, delim, each, keys, isBaseType) {
              return function toString(value, recur) {
                if (!value) {
                  return '';
                }else if (value instanceof Function) {
                  var lines  = value.toString().split(delim);
                  var last   = lines[lines.length-1];
                  var indent = last.indexOf('}');
                  var name   = value.name;
                  if (value['$$_scope']) each(keys(value['$$_scope']), function(key) {
                    var text = toString(value['$$_scope'][key]);
                    if (text) lines.push(name + '.$$_scope.' + key + ' = ' + text);
                  });
                  var length = lines.length-1;
                  return lines.reduce(function(r, v, i, a) {
                    if (v && typeof v == 'string' && v != '') {
                      r.lines.push(v.slice(Math.min(v.search(fstchr), r.indent)));
                    }
                    return i == length ? r.lines : r;
                  }, { indent: indent, lines: [] }).join(delim);
                }else if (recur === false || !value.constructor || isBaseType(value.constructor)) {
                  return value;
                }else if (value.constructor && value.constructor.prototype && value.constructor.name != 'Object') {
                  var lines = [];
                  var ctor  = value.constructor;
                  var name  = ctor.name;
                  lines.push(toString(ctor) + ';');
                  if (ctor.of) lines.push(name + '.of = ' + toString(ctor.of) + ';');
                  if (ctor.pure) lines.push(name + '.pure = ' + toString(ctor.pure) + ';');
                  each(keys(value.constructor.prototype), function(key) {
                    var text = toString(value[key], false);
                    if (text) {
                      if (typeof text == 'string' && !text.match(/\s/) && !text.match(/.*'.*/) && !text.match(/^'.*'$/)) {
                        text = text.quote();
                      }
                      lines.push(name + '.prototype.' + key + ' = ' + text + ';');
                    }
                  });
                  return lines.length ? lines.join(delim) : null;
                }
              }
            })
          ),
        // === isEqual === //
          (function() {
            function objEqual(a, b) {
              var p, t;
              for (p in a) {
                if (typeof b[p] === 'undefined') {
                  return false;
                }
                if (b[p] && !a[p]) {
                  return false;
                }
                t = typeof a[p];
                if (t === 'object' && a[p].constructor == 'Object' && !objEqual(a[p], b[p])) {
                  return false;
                }
                if (t === 'function' && (typeof b[p] === 'undefined' || a[p].toString() !== b[p].toString())) {
                  return false;
                }
                if (a[p] !== b[p]) {
                  return false;
                }
              }
              for (p in b) {
                if (typeof a[p] === 'undefined') {
                  return false;
                }
              }
              return true;
            };
            return function isEqual(a, b) {
              if (a == null && b == null) {
                return true;
              }else if (a == null || b == null) {
                return false;
              }else if (a instanceof Array) {
                return b instanceof Array && a.length == b.length ? a.reduce(function(r, v, i) {
                  return r && isEqual(v, b[i]) ? true : false;
                }, true) : false;
              }else if (typeof a == 'object') {
                if (a.constructor == Object) {
                  return typeof b == 'object' && b.constructor == Object ? objEqual(a, b) : false;
                }else if (a.uid && b.uid
                  && (a.uid instanceof Function ? a.uid() : a.uid) === (b.uid instanceof Function ? b.uid() : b.uid)) {
                  return true;
                }else {
                  return false;
                }
              }else {
                return a === b;
              }
            };
          })()
      ),
    // === Node === //
      (function() {
        return {
          klass: function Node(x) {
            this.$$init(x);
          },
          ext: [
          // === INIT === //
            (function $$init(opts) {
              this._id       = this.ctor.$id = this.id();
              this._cid      = this.extractID(opts);
              this._cache    = {};
              this._started  = 2;
              this.start();

              if (opts.parent && this.is(opts.parent)) {
                this._parent = opts.parent;
                var store = this._parent.get(this._cid);
                if (store && this.test(store)) {
                  this._store = store;
                  this._store.ref(this);
                }else if (this._children && this._cid !== this._children) {
                  //console.log('CHILDREN', this.constructor.name, this._children, this.identifier(), this.cid());
                  this._store = this._parent.children()._store.add(this._cid, this, opts.store);
                // }else if (this._parent._children && this._cid !== this._parent._children) {
                //   console.log('CHILDREN2', this.constructor.name, this._parent._children, this.identifier(), this.cid());
                //   this._store = this._parent.children()._store.add(this._cid, this, opts.store);
                }else {
                  //console.log('DEFAULT', this.constructor.name, this.identifier(), this.cid());
                  this._store = this._parent._store.add(this._cid, this, opts.store);
                }
                if (!this._events) {
                  if (opts.events) {
                    this._events = this._parent._events.child({ name: 'events', parent: this });
                  }else if (this._parent._events) {
                    this._events = this._parent._events;
                  }
                }

                this._level  = (this._parent._level  || (this._parent._level  = 0)) + 1;
                this._offset = (this._parent._offset || (this._parent._offset = 0)) + (opts.offset || 0);
              }else {
                this._store  = opts.store || this._store;
                this._store.ref(this);
                this._level  = 0;
                this._offset = opts.offset || 0;
              }
            }),
            (function connect() {
              var id = this.listener ? this.listener.id : '';
              this.listener = this.parent().listener || this.listener;
              if (!this.listener) {
                var node = this.parent();
                while (node && !node.listener) {
                  node = node.parent();
                }
                if (node) this.listener = node.listener;
              }
              if (!this.dispatcher || id != this.listener.id) {
                this.dispatcher = this.listener.run(this);
              }
              if (!this._events) this._events = this.parent()._events.child({ name: 'events', parent: this });

              return this;
            }),
            (function children() {
              var children = this._children || this.ctor.prop('_children');
              return children ? (this.get(children) || this.node(children)) : this;
            }),
            (function nodes() {
              return this.children().map(function(child, key, node) {
                return child && child.ref instanceof Function ? child.ref() : false;
              }).filter(unit);
            }),
            (function extractID(opts) {
              return (typeof opts == 'string' || opts == 'number') ? opts
                : (opts.name ? opts.name : (opts._id || opts._cid
                  || (!(opts.id instanceof Function ? opts.id
                : (!(opts.cid instanceof Function ? opts.cid : ''))))));
            }),
          // === BASE === //
            (function main() {
              return this;
            }),
            (function store() {
              return this._store;
            }),
            (function of(opts, ctor) {
              return ctor ? new ctor(opts) : new this.constructor(opts);
            }),
            (function is(value) {
              return value && value instanceof this.__;
            }),
            (function uid() {
              return this._store._uid;
            }),
            (function nid() {
              return this.prefix+this._store._uid;
            }),
            (function cid() {
              return this._cid;
            }),
            (function ref(value) {
              return value && value._ref && value._ref instanceof this.__ ? value._ref : value;
            }),
            (function fn() {
              return this._store.root.get('sys.fn');
            }),
            (function lift(f) {
              return this.maybe().lift(f).toIO();
            }),
            (function bin(f) {
              return this._store.root.get('utils.bin')(f);
            }),
            (function($args, $get) {
              return function get() {
                return this.ref($get(this, $args([].slice.call(arguments))));
              }
            })(
              (function args(x) {
                return x && x instanceof Array && x.length
                  ? x.flat().join('.').replace(':', '.') : undefined;
              }),
              (function get(node, key) {
                if (!key && typeof key == 'undefined') return node._store;
                else if (key === '%current') return node._store.get('current') ? get(node, node._store.get('current')) : undefined;
                else if (key && typeof key == 'string' && (node.has(key))) return key.substr(0, 1) === '*' ? node.read(key, node._store.val(key)) : node._store.get(key);
                else if (key && typeof key == 'number') return node._store.at(key);
                else if (key && key.indexOf && key.indexOf('.') > 0) return node._store.path(key);
                else if (key && node._children && node.has(node._children)) {
                  return parseInt(key).toString() === key ? node.nodes().at(parseInt(key)) : node.get(node._children).get(key);
                }else if (key && key instanceof Array) return key.length > 1 ? node._store.path(key) : (key.length ? node.get(key.slice(0).shift()) : node);
                else return key || key === '' ? undefined : (node._ref || node);
              })
            ),
            (function read(key) {
              return this._store.get(key);
            }),
            (function val(key, value) {
              return this._store.val(key, value);
            }),
            (function acc(key, value) {
              return value || typeof value != 'undefined' ? this.set(key, value) : (typeof key == 'undefined' ? this.get() : this.get(key));
            }),
            (function at(index) {
              return this.ref(this.store().at(index));
            }),
            (function first() {
              return this.ref(this.store().first());
            }),
            (function last() {
              return this.ref(this.store().last());
            }),
            (function push(key, value, asArray) {
              return this._store.push(key, value, asArray);
            }),
            (function remove(key) {
              return this.has(key)
                ? (this.emit('change', key, 'remove', this.get(key))
                  || this.clear(key)) : null;
            }),
            (function replace(key, values) {
              return this.lookup(key).map(function(node) {
                var store = node.store();
                store.clear();
                return node.parse(values || {});
              }).orElse(function() {
                this.clear(key);
                return this.child(key).parse(values || {});
              }, this).unit();
            }),
            (function has(key) {
              return (this._store.index(key) >= 0);
            }),
            (function assert(key, value) {
              return (this.get(key) == value);
            }),
          // === EVENTS === //
            (function addEventListener(/* instance, name, selector, target */) {
              return this._events.addEventListener.apply(this._events, [ this ].concat([].slice.call(arguments)));
            }),
            (function removeEventListener(info) {
              return this._events.removeEventListener.call(this._events, info);
            }),
            (function getEventListener(lstnr) {
              return (this._lstnrs || (this._lstnrs = this.instance('listeners', this.__, false))).get(lstnr.hid || lstnr);//this.node('listeners')
            }),
            (function setEventListener(lstnr) {
              return this.getEventListener(lstnr.hid) || this._lstnrs.set(lstnr.hid, lstnr);
            }),
            (function observe(/* [ [ instance ], name, selector, handler ] */) {
              var args = [].slice.call(arguments);
              var inst = typeof args[0] != 'string' ? args.shift() : this;
              if (!inst.dispatcher) inst.connect();
              var hndl = args.pop();
              args.push(typeof hndl == 'string' ? this.handler(hndl) : hndl);
              return inst.setEventListener(inst.dispatcher.addEventListener.apply(inst.dispatcher, [ inst, 'store' ].concat(args)));
            }),
            (function hasEvents(source) {
              return (source._events && source._events._active && source._events._active.length);
            }),
            (function pipe(source, args) {
              var proxy, node = this.hasEvents(source) ? source : this;
              if ((proxy = node.get('proxy', 'click', args.slice(2, 3)))) {
                this.pipe(this, [ args[0], proxy.path, proxy.action || 'update', args[args.length-1] ]);
              }else if ((proxy = this.get('proxy', args[0], args.slice(1, 2)))) {
                this.parent().pipe(this.parent(), [ args[0], proxy.path, proxy.action || 'update', args[args.length-1] ]);
              }else if (this.hasEvents(node)) {
                if (this._started > 1) {
                  node._events.emit(node, args, this);
                }else {
                  this.buffer.push([ node, args, this ]);
                }
              }
            }),
            (function start() {
              if (!this._started && (++this._started)) {
                sys.run().log([ '!START!', this.identifier() ]);
              }else if (this._started == 1 && ++this._started) {
                var evt;
                while (this.buffer.length && (evt = this.buffer.shift())) {
                  this.pipe(evt[0], evt[1], evt[2]);
                }
              }
              return (this._started == 2);
            }),
            (function emit(name, path, type, value) {
              if (this.isEvents || (this._parent && this._parent.isEvents)) {
              }else if (!this._events || !this._events.emit) {
              }else {
                var parts = path.toString().split('.'), key = parts.pop(), source;
                if (parts.length && (source = this.get(parts.join('.'))) && this.is(source) && this.hasEvents(source)) {
                  this.pipe(source, [ name, key, type, value ]);
                }else {
                  this.pipe(this, [ name, parts.append(key).join('.'), type, value ]);
                }
              }
            }),
            (function touch(evt) {

            }),
          // === NODE === //
            (function lookup(key, orElse) {
              return this.maybe().map(function(node) {
                return (key ? (this.isValue(node.get(key)) || ({ value: orElse && orElse instanceof Function ? orElse(node) : orElse })) : { value: orElse }).value;
              });
            }),
            (function search(expr, recur) {
              return this._store.search(expr, recur);
            }),
            (function each(f) {
              return this._store.each(f);
            }),
            (function map(f) {
              return this._store.map(f);
            }),
            (function filter(f) {
              return this._store.filter(f);
            }),
            (function reduce(f, r) {
              return this._store.reduce(f, r);
            }),
            (function parse() {
              return this._store.parse.apply(this, arguments);
            }),
            (function object(k) {
              return this._store.object(k);
            }),
            (function ap(x) {
              return this._store.vals().ap(x);
            }),
            (function bind(/* f, x, s */) {
              return this._store.bind.apply(this._store, arguments);
            }),
            (function info(/* recur, opts */) {
              return this._store.info.apply(this._store, arguments);
            }),
            (function level(offset) {
              return this._level - (offset ? (offset._level || this._offset) : this._offset);
            }),
            (function relative(other) {
              return this.identifier(true).slice(this.is(other) ? other.level(this) : other.level);
            }),
          // === CHILD ETC === //
            (function parent(key, value) {
              return this._parent ? (typeof key === 'undefined' ? this._parent : this._parent.acc(key, value)) : null;
            }),
            (function add(name) {
              return this.get(name) || this.of({ name: name, parent: this });
            }),
            (function child(opts, ctor, parent) {
              parent || (parent = this);
              var exists = (ctor && ctor.prototype.exists ? ctor.prototype : this).exists.call(parent, opts, ctor), instance;
              if (exists && this.is(exists)) return exists;
              var options  = typeof opts == 'object' ? opts : { name: opts, parent: parent };
              options.parent || (options.parent = this);
              if (ctor && this.ctor.test(ctor)) {
                instance = this.of(options, ctor);
              }else {
                if (ctor) this.store().child(options.name, ctor);
                instance = this.of(options, this.constructor);
              }
              return this.emit('change', instance._cid, 'create', instance) || instance;
            }),
            (function exists(options) {
              var opts = options ? (typeof options == 'string' ? { name: options } : options) : {},
              id = opts.name = opts.name || opts.id || opts.cid,
              exists = id ? this.get(id) : false;
              if (exists && this.is(exists)) return exists;
              return false;
            }),
            (function instance(opts, ctor, parent) {
              ctor || (ctor = this.constructor);
              var options = typeof opts == 'object' ? opts : { name: opts, parent: parent };
              options.parent || options.parent === false || (options.parent = this);
              if (!options.parent) options.store = this.store().of(this.uid(), null, opts.name);
              return new ctor(options);
            }),
            (function node(opts) {
              return this.child(opts, this.__);
            }),
          // === VALUES ETC === //
            (function base() {
              return {};
            }),
            (function values(recur, children, nodes) {
              return this._store.values(recur, children, nodes);
            }),
            (function toJSON(recur, children, nodes) {
              return this.values(recur, children, nodes);
            }),
            (function clear(id) {
              if (!id) {
                return this.parent().emit('change', this.cid(), 'remove', this) || this._store.clear();
              }else if (id.indexOf('.') > 0) {
                var path = id.split('.');
                var name = path.pop();
                return this.get(path).clear(name);
              }else if (this._children && id !== this._children) {
                return this.children().clear(id);
              }else if (this.has(id)) {
                return this.emit('change', id, 'remove', this.get(id)) || this._store.clear(id);
              }
              return null;
            }),
            (function index(key) {
              return this._store.index(key);
            }),
            (function ids() {
              return this._store.ids();
            }),
            (function keys(index) {
              return this._store.keys(index);
            }),
            (function vals() {
              return this._store.vals();
            }),
            (function length() {
              return this._store.length();
            }),
            (function select() {
              return this._store.select.apply(this._store, arguments);
            }),
            (function ensure(path, ctor) {
              var node = this, next = node, item, index = 0,
              parts = path instanceof Array ? path.slice(0) : path.split('.');
              while(index < parts.length && (item = parts[index++])) {
                if (false && item == node._cid) continue;
                else if (!(next = node.get(item)))
                next = ((ctor && ctor === true) || (!ctor && node._children)) ? node.node(item) : node.child(item, ctor);
                node = next;
              }
              return node;
            }),
          // === FIND ETC === //
            (function equals(value) {
              if (!value) return false;
              else if (typeof value == 'number') return this.uid() === value; 
              else if (typeof value == 'string') {
                if (value.replace(/[^0-9]/g, '') == value) return this.uid() === parseInt(value);
                else if (value.isLowerCase()) return this.cid() === value;
                else return this.cid() === value;
              }
              return this.is(value) && this.uid() === value.uid() ? true : false;
            }),
            (function closest(key, all) {
              var node = this;
              var type = this.ctor.root().is(key);
              while (node) {
                if (type && key.is(node)) break;
                else if (type) node = all && node._parent ? node._parent : node.parent();
                else if (key instanceof Function && key(node)) break;
                else if (node.equals(key)) break;
                else node = all && node._parent ? node._parent : node.parent();
              }
              return node;
            }),
            (function link() {
              return this.store().link.apply(this.store(), [].slice.call(arguments));
            }),
            (function vmap() {
              return this.store().vmap.apply(this.store(), [].slice.call(arguments));
            }),
            (function haslink() {
              return this.store().haslink.apply(this.store(), [].slice.call(arguments));
            }),
            (function find(value, cached) {
              return this.ref(this.store().find(value, cached));
            }),
            (function pertains(value) {
              if (!value) {
                return false;
              }else if (this.is(value)) {
                return this.equals(value.closest(this));
              }else if (value) {
                return this.pertains(this.ref(this.find(value)));
              }else {
                return false;
              }
            }),
            (function walk(run) {
              return function walk(/* key, callback */) {
                var args  = [].slice.call(arguments);
                var func  = args.pop();
                var node  = args.length ? this : this.parent();
                var parts = args.length ? (typeof args[0] == 'string' ? args.shift().split('.') : args.shift().slice(0)) : this.identifier(true);
                return run(parts, func)(node.store());
              }
            })(
              (function walk(parts, callback) {
                return function next(node) {
                  var key = parts.first();
                  var val = key == 'parent' ? node.parent() : node.get(parts.shift());
                  if (val) {
                    if (callback(val, key, node)) {
                      return val;
                    }else {
                      return val && node.is(val) && parts.length ? next(val) : null;
                    }
                  };
                }
              })
            ),
            (function combine(f, a) {
              return sys.get('async.combine')(this.store(), f, a);
            }),
          // === CONFIGURE === //
            (function state(key, value) {
              return (this._state || (this._state = this.node('state'))).acc(key, value);
            }),
            (function $state(key) {
              return this.state().maybe(key);
            }),
            (function events() {
              var comp = this, events, list = [];
              if ((events = this.get('data.events.data'))) {
                list.push(events.store().bind(function(method, evt) {
                  var parts = evt.split(':').append(comp.handler(method));
                  var slctr = parts[1].split('.'), node;
                  if (slctr.length > 1
                    && (node = comp.get(slctr.shift()))
                    && node instanceof comp.cmpt) {
                    comp.observe.apply(comp, parts.replace(1, slctr.join('.')).prepend(node));
                  }else {
                    comp.observe.apply(comp, parts);
                  }
                }));
              }
              if ((events = this.get('data.events.dom'))) {
                list.push(events.store().bind(function(method, evt) {
                  return comp.on.apply(comp, evt.split(':').append(method.split('|')));
                }));
              }
              if ((events = this.get('data.proxy.data'))) {
                list.push(events.store().bind(function(method, evt) {
                  return comp.proxy.apply(comp, evt.split(':').append(method));
                }));
              }
              if ((events = this.get('data.proxy.dom'))) {
                list.push(events.store().bind(function(method, evt) {
                  return comp.proxy.apply(comp, evt.split(':').append(method));
                }));
              }
              if (!list.length) {
                comp.parse();
                comp.start();
              }
              return list.length ? list.fmap(function() {
                comp.parse();
                comp.start();
                return comp.main() || comp;
              }) : (this.main() || this);
            }),
            (function proxy(name, selector, path, closest) {
              return ((this._proxy || (this._proxy = this.node('proxy'))).get(name)
                || (this._proxy.child(name))).set(selector.split('.').first(), { selector: selector, path: path, closest: closest || false });
            }),
            (function() {
              return [].slice.call(arguments).apply();
            })(
              (function($$closest, $$walk, $$proxy) {
                return function $proxy(evt, proxy) {
                  if (proxy && (evt.currentTarget || (evt.currentTarget = evt.target)).matches(proxy.selector))
                    return $$proxy(proxy.closest ? $$closest(this, proxy.path || proxy.closest) : $$walk(this, proxy), evt, proxy);
                }
              }),
              (function $closest(node, selector) {
                var test = node.closest(selector) || node;
                var prnt = test.parent();
                if (test && test._events && test._events._active && test._events._active.length) {
                  return test;
                }else if (prnt && prnt.cid() === test.cid()) {
                  return prnt;
                }else {
                  return test;
                }
              }),
              (function $walk(node, proxy) {
                var parts = proxy.path.split('.');
                var count = 0, test;

                while (node && ++count < parts.length) {
                  test = node.parent();
                  if (test && node.is(test)) {
                  node = test;
                  }
                }
                return node;   
              }),
              (function $proxy(node, evt, proxy) {
                return node.emit('change', proxy.path, proxy.selector || ('' + (evt.value || evt.target.value || evt.target.id || evt.target.innerText || '')).toLowerCase(), evt.value || evt.currentTarget.value || evt.currentTarget.innerText || '');
              })
            ),
            (function $control() {
              return [].slice.call(arguments).apply();
            })(
              (function($control, $get) {
                return function control() {
                  return $control(this, [].slice.call(arguments), $get);
                }
              }),
              (function $control(obj, args, $get) {
                return $get(obj.get([ 'data.control' ].concat(args.length ? args.flat().join('.').split('.').slice(0, -1) : []).join('.'))
                  || obj.klass('Obj').of(obj.conf.control ? obj.extend({}, obj.conf.control, true) : {}, obj), args);
              }),
              (function $get(obj, args) {
                return obj && args.length ? obj.get(args.pop().split('.').pop()) : obj;
              })
            ),
            (function $handler(evt) {
              if (this._proxy && (evt.currentTarget || (evt.currentTarget = evt.target)))
                this.$proxy(evt, this.get('proxy', evt.type, evt.currentTarget.localName || evt.currentTarget));
              return evt;
            }),
            (function handler(fn) {
              var ctx = { store: this, fn: fn, ref: fn.indexOf('.') > 0 ? fn.split('.').slice(0, -1).join('.').replace(/\.fn$/, '') : '' };
              sys.count('handler');
              return function(evt, hndl) {
                return ((ctx.run || (ctx.run = (ctx.ref ? ctx.store.get(ctx.fn) : ctx.store[ctx.fn]))) || unit).call(
                  (ctx.ctx || (ctx.ctx = (ctx.ref ? ctx.store.get(ctx.ref) : ctx.store))),
                  ctx.store.$handler(evt), hndl
                );
              }
            }),
            (function binding(evt) {
              if (evt.src == 'dom') {
                if (evt.target && evt.currentTarget && evt.currentTarget.id === this.nid()) {
                  var path = this.view().bindelem(evt.target);
                  var name = path.pop();
                  return this.lookup('data.model').prop('current', path).map(function(node) {
                    if (evt.target.getAttribute('type') == 'checkbox') {
                      var raw = node.get(name);
                      var val = typeof raw === 'string' ? raw.trim() : raw, index;
                      if (typeof val === 'boolean') {
                        val = !val;
                      }else if (!val) {
                        val = evt.target.value;
                      }else if (typeof val === 'string') {
                        val = val.split(',');
                        if ((index = val.indexOf(evt.target.value)) > -1) {
                          val.splice(index, 1);
                          val = val.length ? val.join(',') : ' ';
                        }else {
                          val = val.append(evt.target.value).join(',');
                        }
                      }
                      return node.set(name, val);
                    }else {
                      return node.set(name, evt.target.value);
                    }
                  });
                }
              }else if (evt.src == 'data' && this.view()) {
                return this.view().maybe().map(function(view) {
                  return view.$el('[data-bind-path]').chain(function() {
                    return view;
                  }) || view.closest('[data-bind-path]');
                }).chain(function(view) {
                  return view.binding(evt);
                });
              }
            }),
            (function extend(base, ext, keys) {
              return this.ctor.update(base, ext, keys);
            }),
            (function configure(conf) {
              conf || (conf = {});
              var evts = this.get('data.events');

              var opts = this._opts || (this._opts = this.node('opts').parse(this.conf.opts || {}));
              var data = this._data || (this._data = this.node('data').parse(this.xtnd({ id: this.uid() }, this.conf.def || {}), true));

              if (conf.opts) this._opts.parse(conf.opts);

              var cdata = conf.data || {};
              if (conf.tmpl) cdata.tmpl = conf.tmpl;
              else if (!data.get('tmpl')) cdata.tmpl = {};
              if (conf.attrs) cdata.tmpl.attr = this.konst(conf.attrs);
              if (conf.proxy) cdata.proxy = conf.proxy;
              if (conf.events) cdata.events = conf.events;
              if (conf.control) cdata.control = conf.control;

              if (this.conf.data || conf.data || cdata.tmpl) {

                if (!this.conf.data) this.conf.data = {};
                if (this.opts('tmpl') && (cdata.tmpl || this.conf.data.tmpl)
                  && (cdata.tmpl || !data.get('tmpl')))
                    this.data({ tmpl: this.xtnd({ attr: this.konst({ 'class' : this.get('type').concat(' ', this.origin()) }) }, this.extend(this.conf.data.tmpl, cdata.tmpl)) });

                if ((this.conf.data.events || cdata.events)
                  && (cdata.events || !data.get('events')))
                    this.data({ events: this.extend(this.conf.data.events, cdata.events) });
                else if ((this.conf.events || conf.events)
                  && (conf.events || !data.get('events')))
                    this.data({ events: this.extend(this.conf.events, conf.events) });

                if ((this.conf.proxy || conf.proxy)
                  && (conf.proxy || !data.get('proxy')))
                    this.data({ proxy: this.extend(this.conf.proxy, conf.proxy) });

                if ((this.conf.control || conf.control)
                  && (conf.control || !data.get('control')))
                    this._data.set('control', this.klass('Obj').of(this.extend(this.conf.control, conf.control, true), this));
              }
              if (!evts && this.get('data.events')) return this;
              if ((cdata.main || (this.conf.data && this.conf.data.main))
                && (cdata.main || !data.has('main') || !data.get('main').length()))
                  this.data({ main: this.extend(this.conf.data.main, cdata.main) });

              if ((cdata.params || (this.conf.data && this.conf.data.params))
                && (cdata.params || !data.has('params')))
                  this.data({ params: this.extend(this.conf.data.params, cdata.params) });

              if (conf.data) this._data.parse(conf.data, 1);

              return this;
            }),
            (function data(v1, v2) {
              return v1 ? (typeof v1 == 'object' ? this._data.parse(v1, v2 || 2) : this._data.acc(v1, v2)) : this._data.values(true);
            }),
            (function opts(v1, v2) {
              return v1 ? (typeof v1 == 'object' ? this._opts.parse(v1, v2 || 2) : this._opts.acc(v1, v2)) : this._opts.values(true);
            })
          ],
          attrs: [
            (function of(opts) {
              opts || (opts = {});
              if (typeof opts == 'string') {
                return new this({ name: opts });
              }else {
                return new this(opts);
              }
            }),
            (function childOf(parent) {
              return typeof parent == 'string' ? sys().lookup(parent) : sys().of(parent).map(function(p) {
                return Function.prototype.apply.bind(p.child, p);
              }).lift(function(make, args) {
                return make(args);
              });
            })
          ],
          makeSet: function(isEqual) {
            return function set(key, value, path) {
              return key && path !== false && key.indexOf && key.indexOf('.') > 0
              ? (this._store.path(key) ? (isEqual(this._store.path(key), value) ? value
                : (this.emit('change', key, 'update', value) || this._store.path(key, value)))
                  : (this.emit('change', key, 'create', value) || this._store.path(key, value)))
              : (this.has(key) ? (isEqual(this._store.get(key), value) ? value
                : (this.emit('change', key, 'update', value) || this._store.set(key, value)))
              : (this.emit('change', key, 'create', value) || this._store.set(key, value)));
            };
          },
          cache: function(cache) {
            function node(code) {
              return cache.get(code) || cache.node(code);
            }
            function get(node, args) {
              return args.length ? node.get.apply(node, args) : node.get();
            }
            return function() {
              return get(node(this.$code || this.ctor.$code), [].slice.call(arguments));
            }
          },
          source: function(store, left, right) {
            function make(uid, evt) {
              return { uid: uid, evt: evt };
            }
            function log(node, evt) {
              store.push('log', make(node.uid ? node.uid() : (node._id || node._cid || node._eid), evt));
              return evt;
            }
            function get() {
              return store;
            }
            function touch(node, evt) {
              var uid = node.uid();
              if (evt.touched.findIndex(function(x) { return x === uid; }) < 0) {
                evt.touched.push(uid);
              }
              return evt;
            }
            function source(evt) {
              return (evt.cnt ? right : left)(log(this, touch(this, evt)));
            }
            return { get: get, log: log, source: source, touch: touch };
          },
          init: function(type, klass, sys) {
            var store  = sys.root;
            var utils  = store.get('utils');
            var $store = klass.find('$store');
            klass.prop('identifier', utils.get('identifier')('_parent'));
            $store.prop('_identifier', utils.get('identifier')('_ref'));
            klass.prop('conf', { opts: {}, def: {} });
            klass.prop('xtnd', utils.get('extend'));
            klass.prop('test', store.is.bind(store));
            klass.prop('isStore', true);
            klass.prop('set', type.makeSet(utils.get('isEqual')));
            klass.prop('func', klass.fn = utils.get('func'));
            klass.prop('konst', $store.prop('konst', utils.get('$const')));
            klass.prop('bin', utils.get('pass')(utils.get('bind')));
            klass.prop('path', $store.prop('path', utils.get('path')));

            var root = sys.root = klass.of({ name: 'root', store: store });
            var ctor = sys.ctor = this; root.child('process').set('queue', []);

            //var ext  = root.child('ext');
            store.map(function $fn(v,k,i,o) {
              o.ref().child({ name: k });
            });
            klass.base.prototype.cache = type.cache(root.node('cache'));
            var src = klass.prop('$source', type.source(root.node('source'), utils.get('left'), utils.get('right')));
            klass.base.prototype.source = src.source;
            klass.base.prototype.touch = src.touch;
            klass.prop('buffer', []);
            sys.get = utils.get('get')(root);
          }
        };
      }),
    // === Functor === //
      (function Functor() {
        return {
          klass: function Functor(x) {
            this.id = this.ctor.$id = this.id();
            this.$$init(x);
          },
          ext: [
            (function $$init(x) {
              this._x = x;
            }),
            (function uid() {
              return this.id;
            }),
            (function is(value) {
              return value ? (value instanceof this.constructor || value.__ === this.__) : false;
            }),
            (function test(value) {
              return value ? ((value instanceof this.__) || (value.__ === this.__)) : false;
            }),
            (function attr(name, value) {
              this[name] = value;
              return this;
            }),
            (function map(f) {
              return this.of(this._x.map ? this._x.map(f) : f.call(this, this._x));
            }),
            (function join() {
              return this._x || this.mf || this._x || this._f || this._x;
            }),
            (function lift(f) {
              return this.map(function(v1) {
                return function(v2) {
                  return f(v1, v2);
                }
              });
            }),
            (function filter(f) {
              return this.of(this._x.filter ? this._x.filter(f) : f.call(this, this._x));
            }),
            (function find(f) {
              return this.maybe().map(function(ftor) {
                return ftor.filter(f).join() || [];
              }).map(function(result) {
                return result.length ? result.first() : null;
              });
            }),
            (function first() {
              return this.maybe().map(function(ftor) {
                return (ftor.join() || []).first();
              });
            }),
            (function ap(monad) {
              return this.map(function(v) {
                return monad.ap(v).run();
              });
            }),
            (function chain(f) {
              return this.map(f).join();
            }),
            (function run(f) {
              return this.chain(f || unit);
            })
          ],
          attrs: [
            (function of(x) {
              return new this(x);
            }),
            (function pure(x) {
              return new this(x);
            })
          ],
          of: (function(_) {
            return _([].slice.call(arguments, 1));
          })(
            (function(args) {
              return args.shift().call(undefined, args.shift(), args.shift().call(undefined, args.shift(), args));
            }),
            (function(args, ofN) {
              return function of() {
                return ofN(this, args(this, [].slice.call(arguments)));
              }
            }),
            (function args(ctx, a) {
              if (!a.length || typeof a[a.length-1] != 'string' || typeof ctx[a[a.length-1]] != 'string') a.push('$$of');
              return a;
            }),
            (function($count, $off) {
              return function ofN(ctx, args) {
                return $count(args.pop(), ctx, $off[args.length].apply(ctx, args));
              }
            }),
            (function $count(type, curr, next) {
              next[type] = curr[type]+'$';
              next['$$path'] = type+'<<='+(curr._id || curr.id)+curr['$$path'];
              return next;
            }),
            (function of0() {
              return new this.constructor();
            }),
            (function of1(x) {
              return new this.constructor(x);
            }),
            (function of2(x, y) {
              return new this.constructor(x, y);
            })
          ),
          $run: function(operation) {
            return Function.prototype.call.bind(operation.run, operation);
          },
          $atom: function(operation) {
            return function() {
              return operation.run();
            }
          },
          init: function(type, klass, sys) {
            klass.prop('of', type.of);
            klass.prop('$$of',   '');
            klass.prop('$$map',  '');
            klass.prop('$$bind', '');
            klass.prop('$$path', '');
            klass.prop('$$run',  '');
            klass.prop('$$last', '');
            klass.prop('$run', sys.get('utils.call')(type.$run));
            klass.prop('$atom', sys.get('utils.call')(type.$atom));
            klass.prop('$left', sys.get('utils.call')(sys.get('utils.left')));
            klass.prop('$right', sys.get('utils.call')(sys.get('utils.right')));
          }
        };
      }),
    // === ARRAY === //
      (function() {
        return {
          klass: Array,
          basetype: true,
          functor: function() {
            return this.ctor.find('functor').of(this);
          },
          init: function(type, klass, sys) {
            klass.$ctor.konst = sys.fn.$const;
            klass.$ctor.extract = sys.fn.extract;
            klass.find('Functor').attr('$toArray', type.functor);
          }
        };
      }),
    // === Compose === //
      (function Compose(klass, ext, attrs) {
        return function MakeCompose() {
          return { klass: klass, ext: ext, attrs: attrs };
        }
      })(
        (function Compose(f) {
          this.id = this.ctor.$id = this.id();
          this.$$init(f);
        }),
        (function() {
          return [].slice.call(arguments);
        })(
          (function MakeCompose(make, just, next) {
            return make(just, next);
          })(
            (function make(just, next) { 
              return function $fn(f) {
                return function $_compose(g) {
                  return g ? (g.name == 'unit' ? just(f) : (f.name == 'unit' ? just(g) : next(f, g))) : just(f);
                };
              };
            }),
            (function just(f) {
              return function $_just(a) {
                return f(a);
              }
            }),
            (function next(f, g) {
              return function $_next(a) {
                return g(f(a));
              };
            })
          ),
          (function $$init(f) {
            this._f = this.$$cmps(f);
          }),
          (function $$cmps(f) {
            return !f && typeof f == 'undefined' ? unit : (f instanceof Function && f.length > 1 ? this.fn.curry(f) : f);
          }),
          (function ap(monad) {
            return monad.map ? monad.map(this.$fn(this._f)(unit)) : this.ap(this.of(monad));
          }),
          (function apply(monad) {
            return monad.ap(this);
          }),
          (function map(f) {
            return this.of(this.$fn(this._f)(f));
          }),
          (function chain(v) {
            return this.$fn(this._f)(unit)(v);
          }),
          (function run(v) {
            return this.chain(v);
          })
        ),
        (function() {
          return [].slice.call(arguments);
        })(
          (function of(f) {
            return new this(f);
          })
        )
      ),
    // === Cont === //
      (function() {
        return {
          parent: 'Functor',
          klass: (function Cont(x, f) {
            this.$$init(x, f);
          }),
          ext: [
            (function $$init(x, f) {
              this.id = this.ctor.$id = this.id();
              if (x) this.mv = this.$cast(x);
              if (f) this.mf = f;
            }),
            (function mf(t) {
              return function $_pure(f) {
                return f(t);
              }
            }),
            (function $pure(f) {
              return this.mf.name == this.constructor.prototype.mf.name ? f : this.$fn.compose(this.mf)(f);
            }),
            (function $map(f) {
              return function(v) {
                return v instanceof Function 
                && v.name.substr(-4) == 'pure'
                  && (!f.name || f.name.substr(-4) != 'pure' || f.name != 'mf') ? v(f) : f(v);
              }
            }),
            (function map(f) {
              return this.of(this.mv, this.$fn.cast(this.$pure(this.$map(f))), '$$map');
            }),
            (function $bind(mv, mf) {
              return this.of(mv, this.then(this.$fn.cast(mf)), '$$bind');
            }),
            (function bind(f) {
              return this.$bind(this.$cont(true), f);
            }),
            (function fmap() {
              return this.bind(this.of.bind(this));
            }),
            (function ap(monad) {
              return this.test(monad) ? this.bind(function(result) {
                return monad.is(result) ? result.ap(monad) : monad.chain(result);
              }) : this.ap(this.maybe().of(monad));
            }),
            (function apply(monad) {
              return monad.ap(this);
            }),
            (function lift(monad) {
              return this.test(monad) ? this.bind(function(result) {
                return monad.run(result);
              }) : this.lift(this.maybe().of(monad));
            }),
            (function pure() {
              return this.$cont();
            }),
            (function chain(k) {
              this['$$run']+='$';
              return this.enqueue(this.next(this.$cont())(k || unit));
            }),
            (function run(k) {
              return this.chain(k || unit);
            }),
            (function once(k) {
              if (this['$$run']=='') return this.run(k);
            })
          ],
          attrs: (function(cont, val, of, pure) {
            return [
              of,
              cont,
              (function fromCallback(cb, mf) {
                return this.of(mf ? cont(cb, mf) : val(cb));
              }),
              val,
              pure
            ];
          })(
            (function cont(mv, mf) {
              return function $_pure(continuation) {
                return mv(function(value) {
                  return mf(value)(continuation);
                });
              }
            }),
            (function val(v) {
              return function $_pure(continuation) {
                return continuation(v);
              }
            }),
            (function of(x, f) {
              return x instanceof this ? x : new this(x, f);
            }),
            (function pure(x, f) {
              return this.of(x, f);
            })
          ),
          cont: (function $_cont() {
            return this._locked ? this.$value() : this.$cont();
          }),
          $pure: function(r, f) {
            return function $_pure(k) {
              k(f(r));
            }
          },
          resolve: function(ctor, pure) {
            return function(f, g) {
              return this.bind(function $res(r) {
                return f(r) ? (ctor.is(r) ? r.bind($res).cont() : ctor.of(r).bind($res).cont()) : pure(r, g || unit);
              });
            }
          },
          $cont: function(ctor, pure) {
            return function() {
              return ctor.cont(this.mv, this.mf);
            }
          },
          is: function(ctor) {
            return function(value) {
              return value && value instanceof ctor ? true : false;
            }
          },
          $cast: function(v, p) {
            if (v && this.is(v) && v.cont) {
              return v.$cont ? v.$cont() : v.cont();
            }else if (v && v instanceof Array && v.cont) {
              return v.cont().cont();
            }else {
              return v && v instanceof Function
                && (p || v.name.substr(-4) == 'cont'
                    || v.name.substr(-4) == 'pure'
                    || v.name == 'mf') ? v : this.constructor.val(v);
            }
          },
          init: function(type, klass, sys) {
            var proto     = klass.proto(), ctor = klass.$ctor;
            proto.$$cast  = type.$cast;
            proto.$cast   = type.$cast.bind(proto);
            proto.cont    = type.cont;
            proto.next    = unit;
            proto.lazy    = unit;
            proto.$cont   = type.$cont(ctor, proto.mf);
            proto.is      = ctor.is = type.is(ctor);
            proto.resolve = type.resolve(ctor, type.$pure);
            proto.$fn = {
              compose: klass.find('Compose').prop('$fn'),
              cast: sys.get('utils.andThen')(proto.$cast),
              pure: sys.fn.pure
            };
          }
        };
      }),
    // === Reader === //
      (function() {
        return {
          klass: function Reader(f) {
            this.$super.call(this, f);
          },
          ext: [
            (function $$init(f) {
              this._f = f;
            }),
            (function now() {
              return (new Date()).getTime();
            }),
            (function ask() {
              return this.of(unit);
            }),
            (function asks(fn) {
              return this.of(fn);
            }),
            (function unit(ctx) {
              return this.of(this.sys().fn.$const(ctx));
            }),
            (function store(key, value) {
              return typeof value == 'undefined' ? (!key ? this.$store : this.$store.get(key)) : (this.$store.set(key, value));
            }),
            (function count(key, value) {
              if (!this.$stats[key]) this.$stats[key] = value || 1;
              else this.$stats[key] += (value || 1);
              return this;
            }),
            (function get(key) {
              if (typeof key == 'string' && key.substr(0, 4) == 'eff.') {
                return this.eff(key.split('.').slice(1).join('.'));
              }else {
                return typeof key == 'undefined' ? this.$store.get() : this.$store.get(key);
              }
            }),
            (function lookup(key) {
              return typeof key == 'undefined' ? this.$store.maybe() : this.$store.lookup(key);
            }),
            (function link(type, path) {
              return this.$store.get('link').maybe().map(function(link) {
                return link.run(type, path);
              });
            }),
            (function map(f) {
              return this.of(this.$fn(this._f)(f.bind(this)));
            }),
            (function bind() {
              return this.of(Function.prototype.call.bind(function(k, r) {
                return k.call(this, this.run(r)).run(r);
              }, this, [].slice.call(arguments).shift()));
            }),
            (function klass() {
              return this.ctor.find.apply(this.ctor, [].slice.call(arguments));
            }),
            (function find(value, cached) {
              return this.$store.find(value, cached);
            }),
            (function $find(value, cached) {
              return this.$store.maybe().map(function(store) {
                return store.find(value, cached);
              });
            }),
            (function lift(f) {
              return this.map(function(v1) {
                return this.of(function(v2) {
                  return f.call(this, v1, v2);
                });
              });
            }),
            (function location() {
              return this.lift(function(store, loc) {
                return store.get(loc);
              }).run(this.$store);
            }),
            (function save() {
              var args = [].slice.call(arguments).flat().join('.').split('.');
              var name = args.pop();
              var node = this.find(this.$saved).ensure(args);
              return node.set(name, this);
            }),
            (function load() {
              var args = [].slice.call(arguments).flat().join('.');
              return args.length ? this.find(this.$saved).get(args) : this.find(this.$saved);
            }),
            (function pure() {
              return (this._pure || (this._pure = this.$pure(this)));
            }),
            (function run(ctx) {
              return this._f(ctx);
            }),
            (function log() {
              return (sys.log = sys.run().log).apply(undefined, arguments);
            })
          ],
          attrs: [
            (function of(f) {
              return new this(f || unit);
            }),
            (function pure(x) {
              return x instanceof Function ? new this(x) : this.$pure(x);
            }),
            (function fromStore(store) {
              var name = store.cid().toCamel().concat('R');
              var extR = this.ctor.extend(name, { $store: store });
              return extR.of(unit);
            })
          ],
          pure: function(x) {
            return function(f) {
              return f(x);
            }
          },
          init: function(type, klass, sys) {
            klass.$ctor.$pure = type.$pure;
            klass.prop('$stats', {});
            klass.prop('$store', klass.get('root'));
            klass.prop('$pure',  type.pure);
            klass.prop('$saved', klass.$store.node('$$saved').uid());
            klass.prop('of', this.find('Functor').prop('of'));
          }
        };
      })
  ),

  (function MakeAsync() {

    return [].slice.call(arguments);
  })(
    // === IMPORT / PARSE === //
      (function $$ASYNC() {
        var items   = [].slice.call(arguments);
        var utils   = this.store('utils');
        var $async  = this.store().child('async');

        return utils.get('importFuncs')(items, $async);
      }),
      (function pure(t) {
        return function $_pure(f) {
          return f(t);
        }
      }),
      (function cast(t) {
        return t && t instanceof Function && t.name.substr(-4) == 'pure' ? t : function $_pure(f) {
          return f(t);
        }
      }),
      (function inject(f) {
        return function $_pure(succ, fail) {
          succ(f());
        };
      }),
      (function eject(x, f) {
        return function $_pure(succ, fail) {
          x(function(result) {
            succ(f(result));
          }, fail);
        };
      }),
      (function count(cnt, block) {
        return function $_pure(succ, fail) {
          var i = 0;
          (function f(v) {
            i++ < cnt ? block(i)(f, fail) : succ(v);
          })(undefined);
        };
      }),
      (function $_times($_count) {
        return function times(cnt, block) {
          return $_count(cnt, function() {
            return block;
          });
        };
      }),
      (function delay(x, ms) {
        return function $_pure(k) {
          x(function(v) {
            ms ? self.setTimeout(function() {
              k(v);
            }, ms) : k(v);
          });
        };
      }),
    // ===== AsyncAP ===== //
      (function ap(f, x) {
        return function $_pure(succ, fail) {
          var _f;
          var _x;
          var count = 0;
          function fin() {
            if (++count === 2)
              succ(_f(_x));
          }
          f(function (g) {
            _f = g;
            fin();
          }, fail);
          x(function $_pure(r) {
            _x = r;
            fin();
          }, fail);
        };
      }),
      (function get(f) {
        return function(r) {
          return f(r && r instanceof Array && r.length == 1 ? r.first() : r);
        }
      }),
    // ===== AsyncFMAP ===== //
      (function $_fmap($_ap, $_pure) {
        return function fmap(xs, f) {
          return $_ap($_pure(f), xs);
        };
      }),
    // === FlatMap Bind Array == //
      (function flatmap() {
        return [].slice.call(arguments).apply();
      })(
        (function make($_flat) {
          return function flatmap(k, f) {
            return $_flat(k, f || unit);
          };
        }),
        (function() {
          function flat(x, f) {
            return Array.prototype.concat.apply([], x.map(f));
          };
          function bind(f) {
            function bound(x) {
              return x instanceof Array ? flat(x, bound) : f(x);
            };
            return bound;
          };
          return function(k, f) {
            return function(v) {
              return k(flat(v instanceof Array ? v : [ v ], bind(f)));
            }
          };
        })()
      ),
      (function $combine(make) {
        function combine(x, f, a) {
          return x.bind(make(function(v, t, i, j) {
            return f(v, t, i, j);
          }, a, x.length));
        };
        combine['$$_scope'] = { make: make };
        return combine;
      })(
        (function makeCombi(f, a, l) {
          var i = -1;
          var j = 0;
          function $$map(t, v) {
            if (i == l) i = 0;
            return t.map(function(x) {
              return x instanceof Array ? $$map(x, v + 1) : f(v, x, !j ? ++i : i, j++);
            });
          };
          function $map(t) {
            return function(v) {
              return $$map(t, v);
            }
          };
          return $map(a);
        })
      ),
      (function select() {
        return [].slice.call(arguments).apply();
      })(
        (function make($_const, $_filtered, $_select) {
          function select(f, m) {
            return this.chain($_select($_filtered(f || $_const, m || unit)));
          };
          select['$$_scope'] = { '$_filtered': $_filtered, '$_select': $_select };
          return select;
        }),
        (function konst() {
          return true;
        }),
        (function(f, m) {
          function $map(v) {
            return Array.prototype.concat.apply([], (v instanceof Array ? v : [ v ]).map(function(x) {
              return (x instanceof Array ? $map(x) : [ x ]).filter(f);
            }));
          };
          function $wrap(x) {
            var o = x.aid();
            o.arr = false;
            return x.collect(o, function(x) {
              return x.map(function(v) {
                return v instanceof Array ? $wrap(v.map(m)) : v;
              }).collect(o, $map);
            });
          };
          function $run(x) {
            return $wrap(x.map(m));
          };
          return $run;
        }),
        (function(f) {
          return function $_select(x) {
            if (x instanceof Array) {
              return x.map($_select).chain(f);
            }else {
              return x;
            }
          };
        })
      ),
      (function array(xs) {
        return function $_pure(succ, fail) {
          var values = new Array(xs.length);
          var count  = 0;
          xs.forEach(function(x, i) {
            x(function(result) {
              values[i] = result;
              count++;
              if (count == xs.length) {
                succ(values);
              }
            }, fail);
          });
        };
      }),
      (function $_collect($_array) {
        return function() {
          return $_array([].slice.call(arguments));
        }
      }),
      (function $_parallel($_array) {
        return function parallel() {
          var args = [].slice.call(arguments);
          return function $_pure(succ, fail) {
            $_array(args)(function(_args) {
              return succ(_args);
            }, fail);
          };
        }
      }),
      (function(run, series) {
        return function $_series() {
          return series(this.parent('utils.y')(run));
        }
      })(
        (function(loop) {
          return function run(xs) {
            xs[0][0].length == 0 ? xs.pop().splice(0, 2).shift()(xs.shift().pop()) : xs[0][0][0](function (r) {
              xs[0][1][xs[0][1].length] = r;
              xs[0][0].shift();
              return loop(xs);
            }, xs[1][1]);
          }
        }),
        (function(seriesY) {
          return function series() {
            return (function(xs) {
              return function $_pure(succ, fail) {
                return seriesY([ [ xs.slice(0), new Array(xs.length) ], [ succ, fail ] ]);
              };
            })([].slice.call(arguments));
          }
        })
      ),
    // === XHR === //
      (function newxhr() {
        var _xhr = false;
        if (this.XMLHttpRequest) { // Mozilla, Safari, ...
          _xhr = new XMLHttpRequest();
        }else if ( this.ActiveXObject ) { // IE
          try {
            _xhr = new ActiveXObject("Msxml2.XMLHTTP");
          }catch (e) {
            try {
              _xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }catch (e) {}
          }
        }
        return _xhr;
      }),
      (function(wrap, parser, loader, queue) {
        return function $_script($_pure) {
          return wrap(loader, parser, $_pure, queue(this).timer(self.setTimeout, true));
        }
      })(
        (function(loader, parser, pure, queue) {
          return function script(url, key) {
            return loader(pure(parser(url, key)), queue);
          }
        }),
        (function(url, ref) {
          if (typeof url == 'string') {
            if (url.substr(-3, 3) != '.js') url = { url: url };
          }else if (typeof url == 'object') {
          }
          if (ref) {
            url.ref = ref;
          }
          if (url.url && url.url.slice(-3) != '.js'
            && url.url.slice(-4) != '.php') url.url += '.js';
          url.url = url.url.replace(/\$/g, '');
          return url;
        }),
        (function(url, queue) {
          return function $_pure(succ, fail) {
            url(function (info) {
              var head = document.getElementsByTagName('head')[0];
              var url  = info.url;
              var ref  = info.ref;
              var ext  = url.split('.').slice(-1).shift(), script;
              if (ref && (script = head.querySelector('[src="' + url + '"]'))) {
                if (script.getAttribute('data-state') == 'done') {
                  succ(script);
                }else {
                  script.addEventListener('load', function () {
                    succ(this);
                  });
                }
              }else {
                if (ext == 'css') {
                  script = document.createElement("link");
                  script.type = 'text/css';
                  script.rel  = 'stylesheet';
                  script.href = url;
                }else {
                  if (url.substr(0, 6) == 'config' && self.location.pathname == '/') {
                    url = url.replace(/^config/, 'json');
                  }
                  script = document.createElement("script");
                  if (ext == 'tmpl') {
                    script.type = 'text/template';
                  }else if (ext == 'js') {
                    script.type = 'text/javascript';
                  }
                  script.src = url;
                  script.setAttribute('data-state', 'init');
                }
                if (ref) {
                  script.setAttribute('data-ref', ref);
                }
                script.addEventListener('load', function () {
                  this.setAttribute('data-state', 'done');
                  succ(this);
                });
                script.addEventListener("error", function() {
                  this.setAttribute('data-state', 'fail');
                  if (fail) fail(this);
                });
                script.setAttribute('data-state', 'load');
                queue.enqueue(function() {
                  head.appendChild(script);
                });
              }
            }, fail);
          };
        }),
        (function(timer, tick, item, schedule, dequeue) {
          return function(node) {
            var proc = node.get('root.process');
            return proc.set('script', timer({
              tick: tick, item: item, dequeue: dequeue
            }, proc.get('queue'), schedule));
          };
        })(
          (function(o, q, s) {
            o.tick  = o.item(q, o.tick);
            o.timer = function(timer, func) {
              o.$enqueue = timer;
              o.schedule = s(o, func ? o.tick.next : o.tick);
              o.enqueue  = o.dequeue(q, o);
              return o;
            };
            return o;
          }),
          (function(f) {
            return f();
          }),
          (function(queue, tick) {
            return {
              frameid: 0, count: 0,
              next: function() {
                //console.log('async.queue.dequeue', queue.length);
                while (queue.length) tick(queue.shift() || unit);
                return !queue.length;
              }
            };
          }),
          (function(o, i) {
            return function() {
              //console.log('async.queue.schedule');
              unit(o.$enqueue)(i);

            }
          }),
          (function(q, o) {
            return function enqueue(x) {
              if ((q.length * q.push(x)) == 0) {
                o.schedule();
              }
              return q.length;
            }
          })
        )
      ),
      (function $_request($_newxhr, $_pure) {
        return function request(url, options) {
          var request;
          if (typeof (url) === "object") request = $_pure(url);
          else if (typeof (url) === "string") request = $_pure({ 'url' : url, 'cached' : (options === true) });
          else request = url;
          return function $_pure(succ, fail) {
            request(function(_request) {
              var xhr = $_newxhr(), type = _request.type || 'GET';
              xhr.onload = function() {
                if (_request.parse) {
                  try {
                    var ctype = xhr.getResponseHeader('Content-Type');
                    if (ctype && ctype.indexOf && ctype.indexOf('json') > -1) {
                      succ(JSON.parse(xhr.responseText));
                    }else {
                      succ(xhr.responseText);    
                    }
                  }catch (e) {
                    if (fail) fail(e);
                  }
                }else {
                  succ(xhr.responseText);
                }
              };
              xhr.onerror = function (e) {
                e.preventDefault();
                if (fail) fail('masync.' + type + ': ' + e.toString());
              };

              var url = _request.url;
              if (url.slice(0, 4) != 'http') {
                url = self.location.origin+self.location.pathname.replace('core/worker.js', '')+url;
              }
              xhr.open(type, url);
              if (_request.xreqwith !== false) {
                xhr.setRequestHeader('HTTP_X_REQUESTED_WITH', 'XMLHttpRequest');
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
              }
              if (type == 'POST') {
                xhr.setRequestHeader('Content-Type', _request.contentType || 'application/json');
              }
              if (_request.auth) {
                xhr.setRequestHeader('Authorization', _request.auth);
              }
              if (_request.accept) {
                xhr.setRequestHeader('Accept', _request.accept);
              }else {
                xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
              }
              if (!_request.cached) {
                xhr.setRequestHeader('Pragma', 'no-cache');
                xhr.setRequestHeader('Cache-Control', 'no-cache');
                xhr.setRequestHeader('If-Modified-Since', 'Thu, 01 Jun 1970 00:00:00 GMT');
              }
              if (_request.type == 'GET' || !_request.data) xhr.send();
              else xhr.send(_request.data);
            }, fail);
          };
        }
      })
  ),

  (function MakeApp() {
 
    return [].slice.call(arguments);
  })(
    (function $$APP(enq, run) {
      var sys = this.get('sys');
      if (sys.isWorker) return;
      return run.call(enq(sys), sys.get('async.script'), this.store().ensure('assets.core').store());
    }),
    (function(sys) {
      function enqueue(deps, run) {
        return sys.klass('Cont').of([ deps, run ], function(d) {
          return function $_pure(k) {
            sys.enqueue(d.shift(), d.pop(), true).run(k);
          }
        }).attr('name', deps.name);
      };
      sys.enqueue = enqueue;
      return sys;
    }),
    (function(script, store) {
      this.get('async.collect')(
        script({ url: 'core/app.js',     ref: store.child('app').uid() }),
        script({ url: 'core/router.js',  ref: store.child('router').uid() }),
        script({ url: 'core/worker.js',  ref: store.child('worker').uid() }),
        script({ url: 'core/effect.js',  ref: store.child('effect').uid() }),
        script({ url: 'core/config.js',  ref: store.child('config').uid() }),
        script({ url: 'core/storage.js', ref: store.child('storage').uid()})
      )(function() {
        store.get('app.cont').run();
      });
    })
  )

);
