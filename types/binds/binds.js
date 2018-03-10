define(function() {

    return this.enqueue({

        name: 'types.binds',

        deps: {

            core: [ 'pure' ],

            scripts: [ 'doT', 'task' ],

            templates: [ 'base' ]

        }

    }, function() {

        return {

            init: function(deps) {

                return deps('core.pure')(function(sys) {
                    return function(app) {
                        app.ext.binds = sys.get().child('binds').parse(app.binds, 1);
                        return app;
                    }
                })(this);
            },

            ext: {

                make: function(type) {

                    return this.get('binds.make')('object')(this.get('types', type);

                    //     .run(

                    //     typeof impl == 'string'
                    //         ? binds.get('impl', type, impl).apply(undefined, [].slice.call(arguments, 1))
                    //             : impl

                    // ));

                }

            },

            binds: {

                types: {

                    store: sys.klass('Bind').pure(function(f, g, m) {

                        // f --> effect function
                        // g --> input adapter (optional)
                        // m --> level change assistant (optional)
                        return function $bind(x, r, l) {

                            return function $fn(v, i, o) {
                                var k = r && r.keys ? r.keys(i) : v.name;
                                if (r && r.is && r.is(v)) return v.vals().bind($bind(l ? (x instanceof Array ? (x[x.push({})-1][k] = []) : (x[k] = {})) : x, v, l+1));
                                else if (v instanceof Array) return v.bind($bind(l ? (x instanceof Array ? (x[x.push({})-1][k] = []) : (x[k] = {})) : x, v, l+1));
                                else return f(x, v, k, i, r && r._ref ? r.ref() : o) || v;
                            };

                        };

                    }, sys.get('utils.bin')(function(node, value) {

                        return node.is(value) ? value.vals() : (value instanceof Array ? value : [ value ]);

                    })(sys.get()), function(f, t, j, x, l) {

                        return function(v, i, o) {
                            return f(t, v, j, x, l);
                        }

                    }),

                    object: sys.klass('Bind').pure(function(f, g, m) {

                        return function $bind(x, r, l) {

                            return function $fn(k, i, o) {
                                var v = f(x, r[k], k, i, r, l);
                                return v instanceof Array ? v.bind(m(f, (x[k] = {}), k, v, l+1))
                                : (typeof v == 'object' && v.constructor.name == 'Object' ? g(v).bind($bind((x[k] = {}), v, l+1)) : v);
                            };

                        };

                    }, sys.get('utils.bin')(function(node, value) {

                        return node.is(value) ? value.keys()
                            : (value instanceof Array ? value
                                : (typeof value == 'object' ? Object.keys(value) : [ value ]));

                    })(sys.klass('Obj')), function(f, t, j, x, l) {

                        return function(v, i, o) {
                            return f(t, v, j, x, l);
                        }

                    })

                },

                impl: {

                    store: {

                        fold: function(f) {
                            return function(r, v, k, i, o) {
                                if (f) {
                                    f(r, v, k, i, o);
                                }else if (r instanceof Array) {
                                    if (v && v.name) {
                                        r.push(v);
                                    }else {
                                        r[r.push({})-1][k] = v;
                                    }
                                }else {
                                    r[k] = v;
                                }
                                return v;
                            }
                        },

                        filter: function(expr) {
                            return function(r, v, k, i, o) {
                                if ((v && typeof v == 'string' && v.like(expr))
                                  || (k && typeof k == 'string' && k.like(expr))
                                    || (o && o.isStore && o.identifier && o.identifier().like(expr))) {
                                    r[k] = v;
                                }
                                return v;
                            }
                        },

                        info: function() {
                            return function(r, v, k, i, o) {
                                r[k] = v;
                                console.log('Bind', o && o.is ? [ o.identifier(), k, v, i ] : [ v, o, i ]);
                                return v;
                            }
                        }

                    },

                    object: {

                        fold: function(f) {
                            return function(r, v, k, i, o) {
                                if (f) {
                                    f(r, v, k, i, o);
                                }else if (r instanceof Array) {
                                    if (v && v.name) {
                                        r.push(v);
                                    }else {
                                        r[r.push({})-1][k] = v;
                                    }
                                }else {
                                    r[k] = v;
                                }
                                return v;
                            }
                        },

                        info: function() {
                            return function(r, v, k, i, o) {
                                r[k] = v;
                                console.log(v, k, i);
                                return typeof v == 'string' ? ('!!' + v + '!!') : v;
                            }
                        }

                    }

                },

                data: {

                    store: function(bind) {

                        return function(path, result) {

                            return bind(sys.get(path).store(), result).bind(unit);

                        };

                    },

                    object: function(bind) {

                        return function(obj, result) {
                            return bind(obj || {

                                name: 'modal',

                                obj1: { naam: 'Erik', address: { street: 'Doornburg', nr: '166' } },

                                deps: {

                                    components: [ 'layout' ],

                                    core: [ 'pure' ],

                                    scripts: [ 'doT' ],

                                    templates: [ 'base' ]
                                }

                            }, result || {});
                        };

                    }

                }

            }
        };

    });

});

