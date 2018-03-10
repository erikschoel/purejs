define(function() {

  return this.enqueue({

    name: 'core.api',

    deps: {

      core: [ 'pure' ]

    }

  }, function() {

    return {

      init: function(deps) {
        return deps('core.pure')(function(sys) {
          return function(app) {
            var eff = sys.eff('sys.eff.parse').run(app.eff);
            return sys.klass('Node').parse(app.klass()).prop('root');
          }
        })(this);
      },

      eff: (function() {
        return {
          type: 'IO',
          path: 'api',
          request: [
            (function() {
              return [].slice.call(arguments).apply();
            })(
              (function(parse, make, handler, error, extend) {
                return function define() {
                  var args = [].slice.call(arguments);
                  var base = typeof args[0] === 'object' ? args.shift() : {};
                  base.parse = parse;
                  if (!base.name) base.name = args.length && typeof args[0] === 'string' ? args.shift() : 'ApiCont';
                  return extend.call({
                    name: base.name,
                    of: make(base, sys.get('async.request')),
                    mf: sys.get('utils.maybe')(handler(sys.get('utils.left'), sys.get('utils.right'), error))
                  });
                }
              }),
              (function(val) {
                var args = typeof val[0] === 'object' ? val.shift() : {};
                if (val.length && typeof val[0] === 'object') args.data = val.shift();
                if (val.length) args.query = val.slice(0);
                return args;
              }),
              (function(base, request) {
                return function() {
                  var args = base.parse([].slice.call(arguments));
                  var url = [ base.url || args.url || '' ].concat(args.query || []).filter(Boolean).join('/');
                  return (new this(request({
                    url: url, parse: base.parse !== false,
                    data: args.data, type: args.type || (args.data ? 'POST' : 'GET')
                  })));
                }
              }),
              (function(left, right, error) {
                return function(result) {
                  if (result.error) {
                    return left(result)(error);
                  }else {
                    return right(result)(error);
                  }
                }
              }),
              (function(e) {
                console.log(e);
                return e;
              }),
              (function() {
                return sys.klass('Cont').extend(
                  this.name, {
                    mf: this.mf
                  }, {
                    of: this.of
                  }
                );
              })
            )
          ],
          factory: {
            request: {}
          }
        };
      }),

      klass: function() {
        return {
          klass: function Api(opts) {
            this.$super(opts || {});
            this.node('config');
          },
          ext: [
            { name: '_children', value: 'nodes' },
            { name: '_config', value: { location: 'url', path: 'query' } },
            (function endpoint() {
              return [].slice.call(arguments).apply();
            })(
              (function(make) {
                return function endpoint() {
                  var args = [].slice.call(arguments);
                  if (args[0] instanceof Array) {
                    return args.shift().reduce(function(r, v) {
                      var t = make(r.base, [ v ]);
                      r[t.cid()] = t;
                      return r;
                    }, { base: this });
                  }else {
                    return make(this, args);
                  }
                }
              }),
              (function(api, args) {
                var name = typeof args[0] == 'string' ? args.shift() : '';
                var opts = typeof args[0] == 'object' ? args.shift() : { query: name };
                if (!opts.query) opts.query = name;
                var node = api.child(opts.name || name);
                node.get('config').parse(opts);
                return node;
              })
            ),
            (function config(item) {
              return this._config[item] || item;
            }),
            (function location() {
              var local = this.get('config.' + this.config('location'));
              if (local) return local;
              var parent  = this.parent(),
                local   = this.get('config.' + this.config('path')) || '',
                inherit = parent instanceof this.constructor ? parent.location() : false;
              return inherit ? (inherit + '/' + local) : local;
            }),
            (function transformer() {
              var args = [].slice.call(arguments);
              var func = args.pop();
              var node = args.length ? this.child(args.shift()) : this;
              node._request = this.make().map(function(req) {
                return req.bind(func);
              });
              return node;
            }),
            (function make() {
              return this.lift(function(api, opts) {
                return api.get('config').values(true).clone({
                  url: api.location(), query: ''
                }).clone(typeof opts === 'object' ? opts : (opts ? { query: opts } : {}));
              }).map(this.$fx.cont.of);
            }),
            (function request() {
              return (this._request || (this._request = this.make()));
            }),
            (function execute(opts, parent) {
              var req = this.request().run(opts);
              return parent ? req.ap(parent.model()).bind(unit) : req;
            })
          ],
          init: function(type, klass, sys) {
            klass.prop('root', sys.root.child('api', klass.$ctor));
            klass.prop('$fx', { cont: sys.eff('api.request.define').run() });
          }
        };
      }

    };

  });

});
