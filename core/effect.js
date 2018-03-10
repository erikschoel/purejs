(function(effects) {

  define(function() {

    return effects(sys).attr('name', 'core.effect');

  });

})(

  (function Effects() {
 
    return [].slice.call(arguments).pure(0, true);
  })(
    // === Environment Setup === //
      (function WrapSetup(items) {
        return function effects(sys) {
          return items.shift().call(undefined, items.shift().apply(true), items, sys);
        };
      }),

      (function Setup(env, defs, sys) {
        return sys.klass('Cont').of(defs, function(d) {
          var eff = env(sys.get(), sys);
          var get = eff.runDefs(eff, defs);
          return get.fmap(function() {
            sys.run().eff = sys.ctor.prop('eff', eff.getOperation('js.nodes.fn').chain(function(op) {
              return op.run(eff)('runOperation');
            }));
            sys.run().enqueue = sys.eff('sys.loader.enqueue').init().unsafePerformIO;
            return sys;
          });
        });
      }),
   
      [(function CreateSetup(createInstruction, createHandler, createFn, createEnv, createEffects) {
        return function(root, sys) {
          return root.child('effects', createEnv.call({
            sys: sys,
            handler: createInstruction.call(
              createFn(sys).call(createHandler.call(sys))
            )
          }));
        }
      }),

      (function CreateInstruction() {

        function Instruction(handler, instruction) {
          this._handler     = handler;
          this._instruction = instruction;
          this._cache       = {};
        };
        Instruction.prototype.constructor = Instruction;
        Instruction.prototype.type = 'Instruction';
        Instruction.prototype.init = function(method, result, type) {
          var i = this._instruction;
          var t = type || i.type || result || i.node.parent('type');
          var a = [ method || i.method, t, i.action, result || i.result || t ];
          var p = a.join('.');
          return this._cache[p] || !a.unshift(i.node) || (this._cache[p] = this._handler.init.apply(this._handler, a));
        };
        Instruction.prototype.of = function(method, result, type) {
          return this.init(method, result, type);
        };
        Instruction.prototype.show = function() {
          return this._instruction;
        };
        Instruction.prototype.get = function(key) {
          if (key == 'type') return this._handler.eff;
          return this._instruction.node.parent(key);
        };
        Instruction.prototype.map = function() {
          var args = Array.prototype.slice.call(arguments);
          var func = args.shift();
          var inst = this.init.apply(this, args);
          return inst.map ? inst.map(func) : func(inst);          
        };
        Instruction.prototype.bind = function() {
          var args = Array.prototype.slice.call(arguments);
          var func = args.shift();
          var inst = this.init.apply(this, args);
          return inst.bind ? inst.bind(func) : func(inst);
        };
        Instruction.prototype.ap = function() {
          var args  = Array.prototype.slice.call(arguments);
          var monad = args.shift();
          var inst  = this.init.apply(this, args);
          return inst.ap ? inst.ap(monad) : monad.lift(inst);   
        };
        Instruction.prototype.lift = function() {
          var args = Array.prototype.slice.call(arguments);
          var func = args.shift();
          var inst = this.init.apply(this, args);
          if (inst.nest) inst = inst.nest();
          return inst.lift ? inst.lift(func) : func(inst);
        };
        Instruction.prototype.just = function() {
          var args = Array.prototype.slice.call(arguments);
          var inst = this.init.call(this, 'just');
          return this.$run(inst, args);
        };
        Instruction.prototype.$run = function(inst, args) {
          if (inst && inst.run) {
            return args.length > 1 ? inst.run.apply(inst, args) : (args.length ? inst.run(args.shift()) : inst.run());
          }else if (inst && inst instanceof Function) {
            return args.length > 1 ? inst.apply(undefined, args) : (args.length ? inst(args.shift()) : inst());
          }
          return inst;
        };
        Instruction.prototype.run = function() {
          var args = Array.prototype.slice.call(arguments);
          var inst = this.init();
          return this.$run(inst, args);
        };
        this.prototype.isInstruction = function(value) {
          return value && value instanceof Instruction ? true : false;
        };
        this.prototype.create = function(instruction) {
          return new Instruction(this, instruction);
        };
        return this;
      }),

      (function CreateHandler() {
        function Handler(env) {
          if (env) this.env = env;
        };
        Handler.prototype.constructor = Handler;
        Handler.prototype.env  = Handler.env  = this.get();
        Handler.prototype.just = Handler.just = this.klass('maybe').pure;
        Handler.prototype.init = function(node, method, type, action, result) {
          return this.just(this.fn[method]).map(function(runInit) {
            return runInit(type, node.get(action), result);
          }).unit();
        };
        Handler.prototype.eff = this.klass('io').make(function EffIO(x) {
          this.$super(x);
        }, function(x) {
          return sys.eff(x.replace(/eff\./, '')).init();
        });
        Handler.of = function(env) {
          return new Handler(env);
        };
        return Handler;
      }),

      [(function CreateFn(wrap, fn) {
        return function(sys) {
          return wrap(fn(sys.get('utils.point')));
        }
      }),

      (function CreateWrap(fn) {
        return function() {
          this.prototype.fn = fn;
          return this;
        }
      }),

      (function fn(base) {
        function cast(type) {
          var ctor = type.is ? type : sys.klass(type);
          return function(value) {
            return ctor.test(value) ? value : ctor.$ctor.pure(value);// && value instanceof ctor.$ctor ? value : ctor.pure(value);
          }
        };
        function just(type, value, fn) {
          return type.is && type.of ? type.of(value) : sys.klass(type).fromConstructor(fn || 'pure', value);
        };
        function apply(monad, type) {
          return function $_apply(value) {
            return monad.ap(type(value));
          }
        };
        function bind(monad) {
          return function $_bind(type) {
            return apply(monad, cast(type));
          }
        };
        function lift(fn) {
          return function $_lift(value) {
            return fn(value);
          }
        };
        function pure(monad) {
          return function $_pure(value) {
            return monad.run(value);
          }
        };
        function embed(monad, type) {
          return function $_embed(value) {
            return monad.chain(function(instance) {
              return just(type, instance.of(value));
            });
          }
        };
        function of(run, type) {
          return function $_of(value) {
            return type(run(value));
          }
        };
        function utils(monad, args) {
          return function $_utils() {
            return function $_fn() {
              var args = [].slice.call(arguments);
              var prop = args.shift();
              return monad.$fn(value);
            }
          }
        };
        return {
          of: function(type, value, result) {
            return just(type, value, 'of');
          },
          just: function(type, value, result) {
            return just(type, value);
          },
          typed: function(type, value, result) {
            return just(type, bind(just(type, value)));
          },
          cast: function(type, value, result) {
            return just(type, of(pure(just(type, value)), cast(result || type)));
          },
          embed: function(type, value, result) {
            return embed(just(type, value), result);
          },
          utils: function(type, value, result) {
            return utils(just(type, value))
          },
          bind: function(type, value, result) {
            return just(type, bind(just(type, value))(result || type));
          },
          lift: function(type, value, result) {
            return just(type, lift(base.lift2M(value, cast(result || 'Maybe'))));
          },
          pure: function(type, value, result) {
            return pure(just(type, value));
          },
          maybe: function(type, value, result) {
            return apply(just(type, value), cast(result || 'Maybe'));
          },
          run: function(type, value, result) {
            return value;
          }
        };
      })],

      (function CreateEnv() {
        return this.sys.klass('node').parse({
          klass: function Env(x) {
            this.$super(x);
            this._handler = this.Handler.of(this);
            this._cache   = {};
          },
          ext: [
            this.handler,
            (function isInstruction(value) {
              return this._handler.isInstruction(value);
            }),
            (function extractDef(def) {
              return def && def instanceof Function ? def(unit) : def;
            }),
            (function parseDefs(defs) {
              var def, eff;
              while (defs.length && (eff = this.extractDef(defs.shift()))) {
                this.addOperation(eff);
              };
              return this;
            }),
            (function runDefs(env, defs) {
              return defs.bind(function(eff) {
                return env.addOperation(env.extractDef(eff), true);
              });
            }),
            (function addOperation(op, lazy) {
              var path = op.path;
              var node = this.ensure(path);
              return lazy ? this.klass('Obj').of(op).bind(function(x, v, k, i, o, l, a) {
                if (typeof v == 'object') {
                  node.child(k).parse(v, true);
                }else {
                  node.set(k, v);
                }
              }).collect() : node.parse(op, true);
            }),
            (function runOperation(path) {
              return this.getOperation(path).chain(unit);
            }),
            (function getNode(location) {
              return this.maybe().map(function(env) {
                return env.walk(location, function(value, key, node) {
                  return node.lookup('factory').chain(function(factory) {
                    return factory.get(key) ? node.is(value) : false;
                  });
                });
              }).chain(function(loc) {
                return loc.ref();
              });
            }),
            (function getFactory() {
              var args = [].slice.apply(arguments);
              var node = args.length && this.is(args[0]) ? args.shift() : this.getNode(args.shift());
              return node.parent('factory').lookup(node.cid()).orElse(node.parent('factory.defaults'));
            }),
            (function getAction(location) {
              return this._handler(location);
            }),
            (function eachOperation(location, init) {
              var node = location && this.is(location) ? location : this.getNode(location), base = this;
              var path = node.identifier(true).slice(this.level(node));
              var data = node.map(function(v, k, n) {
                return base.getOperation(path.concat(k).join('.'), init);
              });
              return this._handler.just(data);
            }),
            (function cacheOperation(location, init) {
              return this.maybe().lift(function(env, node) {
                var parts = (location instanceof Array ? location : location.split('.')).slice(node.level(env));
                if (!parts.length) {
                  return env.eachOperation(node, init);
                }else {
                  var path    = parts.join('.');
                  var action  = parts.shift();
                  var factory = env.getFactory(node);
                  var options = factory.get(action).values(true).orElse({}).unit();
                  if (options.args) {
                    node.set(action, node.get(action).call(sys.run(), sys.get().store().select(options.args)));
                  }
                  var method  = parts.length ? parts.shift() : (options.method || node.get('method') || 'just');
                  var result  = parts.length ? parts.shift() : options[method];
                  return env.initOperation(env._handler.create({
                    node:    node,
                    path:    location,
                    action:  action,
                    options: options,
                    method:  method,
                    result:  result
                  }), init || false);
                }
              }).ap(this.getNode(location));
            }),
            (function initOperation(location, init) {
              if (!location || init === false) return location;
              if (typeof location == 'string') return this.getOperation(location, true);
              else if (this.isInstruction(location)) return location.init();
              return location;
            }),
            (function makeOperation(location, init) {
              return (this._cache[location] = this.cacheOperation(location, init));
            }),
            (function getOperation(location, init) {
              if (location.indexOf('.') < 0) location = 'sys.eff.' + location;
              else if (location.first() == 'effects') location = location.parts(1);
              return this._cache[location] || this.makeOperation(location, init);
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
            })
          ]
        }).$ctor;
      })],
    // === Initial effects === //
      (function CreateEffects() {
        // target - environment operations - list of instructions
        return [].slice.call(arguments);
      })(
    // === sys.eff === //
        (function() {
          return {
            type: 'IO',
            path: 'sys',
            eff: [
              (function parse(base) {
                return function parse(defs) {
                  return base.effects.ref().parseDefs(defs instanceof Array ? defs : [ defs ]);
                }
              })
            ],
            factory: {
              eff: {
                defaults: {
                  method: 'bind',
                  just: 'Maybe',
                  bind: 'Maybe'
                },
                parse: {
                  args: [ 'effects' ],
                  method: 'just',
                  just: 'Maybe'
                }
              }
            }
          };
        }),
    // === dom.calc === //
        (function() {
          return {
            type: 'IO',
            path: 'dom',
            calc: [
              (function size(element) {
                return (typeof element == 'string' ? sys.get('eff.dom.elements.query').run(element) : sys.klass('Maybe').of(element)).chain(function(el) {
                  return [ el.clientWidth, el.clientHeight ];
                });
              }),
              (function position(el) {
                var xPos = 0;
                var yPos = 0;

                while (el) {
                  if (el.tagName == "BODY") {
                    var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
                    var yScroll = el.scrollTop || document.documentElement.scrollTop;

                    xPos += (el.offsetLeft - xScroll + el.clientLeft);
                    yPos += (el.offsetTop - yScroll + el.clientTop);
                  }else {
                    xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
                    yPos += (el.offsetTop - el.scrollTop + el.clientTop);
                  }

                  el = el.offsetParent;
                }
                return { x: xPos, y: yPos };
              }),
              (function viewport() {
                return sys.get('sys.eff')('dom.calc.size').run(document.body);
              })
            ],
            factory: {
              calc: {

              }
            }
          };
        }),
    // === dom.elements === //
        (function() {
          return {
            type: 'IO',
            path: 'dom',
            elements: [
              (function create(tag) {
                return document.createElement(tag);
              }),
              (function extract(input) {
                return [ input ].map(function(x) {
                  return (typeof x == 'number' && (x = (''+x))) || typeof x == 'string' ? document.getElementById(x.replace('#', '')) : x;
                }).first();
              }),
              (function match(selector) {
                return function(elem) {
                  return elem && elem.matches(selector) ? true : false;
                }
              }),
              (function attr(run, value, assign) {
                return function attr(element) {
                  return run(value, assign, element);
                }
              })(
                (function attr($value, $assign, elem) {
                  return function(attr, value) {
                    return attr == 'value' ? $value(elem, value) : $assign(elem, attr, value);
                  }
                }),
                (function value($val) {
                  return function(e, v) {
                    return $val(e, v);
                  }
                })(
                  (function(element, value) {
                    if (!element) return;
                    var querying = !value && [].slice.call(arguments).length < 2;

                    switch (this.baseTag(element)) {
                      case 'h':
                        return this.innerText(element, value);
                      case 'textarea':
                        return this.innerHTML(element, element.value = value);
                      case 'input':
                        var type = this.type(element);
                        if (querying) {
                          return this.getValue(element);
                        }else if (type == 'radio') {
                          if (element.value == value) {
                            element.checked = true;
                            return this;
                          }else if (element.checked) {
                            element.checked = false;
                            return this;
                          }
                        }else if (type == 'checkbox') {
                          if (value && (value === true || value.indexOf(element.value) > -1)) {
                            element.checked = true;
                            return this;
                          }else if (element.checked) {
                            element.checked = false;
                            return this;
                          }
                        }else {
                          return element.value = value;
                        }
                        return;
                      case 'select':
                        return this.children(element, 'option').reduce(function(v, o) {
                          if (o.value == v.value) {
                            o.setAttribute('selected', 'selected');
                          }else if (o.hasAttribute('selected')) {
                            v.previous = o.value;
                            o.removeAttribute('selected');
                          }
                          return v;
                        }, { value: element.value = value, previous: null });
                      case 'option':
                        return this.setValue(element, value);
                      default:
                        return this.innerHTML(element, value);

                      return this.getValue(element);
                    }
                  }).bind({

                    children: function(e, s) {
                      return e ? [].slice.call(e.querySelectorAll(s)) : [];
                    },

                    innerText: function(e, v) {
                      return { previous: e.innerText, value: e.innerText = v };
                    },

                    innerHTML: function(e, v) {
                      return { previous: e.innerHTML, value: e.innerHTML = v };  
                    },

                    type: function(e) {
                      return e.getAttribute('type');
                    },

                    baseTag: function(e) {
                      var t = e.localName;
                      if (t.length == 2 && (''+(parseInt(t.substr(-1))||'')) === t.substr(-1)) {
                        return t.substr(0, 1);
                      }else {
                        return t;
                      }
                    },

                    getAttr: function(e, a) {
                      return e ? (e.getAttribute ? e.getAttribute(a) : e[a]) : null;
                    },

                    setAttr: function(e, a, v) {
                      return e ? (e.setAttribute ? (e.setAttribute(a, v) || v) : (e[a] = v)) : null;
                    },

                    attr: function(e, a, v) {
                      return v ? this.setAttr(e, a, v) : this.getAttr(e, a);
                    },

                    getValue: function(e) {
                      return this.getAttr(e, 'value') || e.value;
                    },

                    setValue: function(e, v) {
                      return this.setAttr(e, 'value', v) || (e.value = v);
                    }
                  })
                ),
                (function assign(e, k, v) {
                  if (k == 'style') {
                    e.style.cssText = e.style.cssText + ' ' + v;
                  }else if (k == 'class') {
                    debugger;
                  }else if (k == 'html') {
                    e.innerHTML = v;
                  }else if (k == 'innerText' || k == 'innerHTML') {
                    e[k] = v;
                  }else if (e.setAttribute) {
                    e.setAttribute(k, v);
                  }else {
                    e[k] = v;
                  }
                  return v;
                })
              ),
              (function attrs(make, assign) {
                return function attrs() {
                  var mkobj = this.klass('Obj');
                  var func  = make(mkobj.of, assign);
                  var args  = this.get('utils.getArgs')(func);
                  var curr  = this.get('utils.curry')(func);
                  var scope = curr['$$_scope'] = {};
                  scope['$$_main'] = func;
                  scope['$object'] = mkobj.$ctor.of;
                  scope['$assign'] = assign;
                  scope['$attr']   = this.eff('dom.elements.attr').init();
                  scope['$$_args'] = args;
                  return curr;
                }
              })(
                (function($object, $folder, $attr) {
                  return function attrs(elem, object) {
                    $object(object || {}).fold($folder, {
                      elem: elem, attrs: attrs, attr: $attr
                    });
                    return elem;
                  };
                }),
                (function $folder(r, v, k, i, o) {
                  if (k == '$key') {
                    r.attrs(r.elem[v], o[v]);
                  }else if (o['$key'] && o['$key'] == k) {
                    return k;
                  }else if (v instanceof Array) {

                  }else if (typeof v == 'object') {
                    r.attrs(r.elem[k], v);
                    return;
                  }else if (k == 'text' || k == 'innerText') {
                    r.elem['innerText'] = v;
                  }else if (k == 'innerHTML') {
                    r.elem[k] = v;
                  }else if (k == 'className') {
                    r.elem.className = v;
                  }else if (k == 'class') {
                    r.elem.classList.add.apply(r.elem.classList, v.split(' '));
                  }else if (r.elem.setAttribute) {
                    r.elem.setAttribute(k, v);
                  }else {
                    r.elem[k] = v;
                  }
                  return v;
                })
              ),
              (function query(selector, elem) {
                elem || (elem = document);
                if (typeof elem == 'string') elem = document.querySelector(elem);
                if (!selector) {
                  return [];
                }else if (selector instanceof Element) {
                  return selector;
                }else if (typeof selector == 'string') {
                  if (selector == '>') {
                    return [].slice.call(elem.children);
                  }else if (selector.slice(0, 1) == '>') {
                    var s = selector.slice(1).trim();
                    return [].slice.call(elem.children).filter(function(e) {
                      return e.matches(s);
                    });
                  }else if (selector.slice(0, 1) == '#') {
                    return elem.getElementById(selector.slice(1)) || elem.querySelector(selector);
                  }else if (selector.match(/^(html|head|body)$/)) {
                    return elem.getElementsByTagName(selector).item(0);
                  }else {
                    return Array.prototype.slice.call(elem.querySelectorAll(selector) || []);
                  }
                }else {
                  return [];
                }
              }),
              (function find(base) {
                return base.curry(function(elem, selector) {
                  return selector instanceof Element ? selector : (elem.matches(selector) ? elem : elem.querySelector(selector));
                });
              }),
              (function toggle(make, wrap) {
                return function toggle() {
                  return wrap(make.call(this), this.eff('dom.elements.query').init());
                }
              })(
                (function() {
                  return this.klass('io').of(function(klass) {
                    return this.fx(function(elem) {
                      return elem.map(function(el) {
                        if (el.classList.contains(klass)) {
                          el.classList.remove(klass);
                          if (!el.classList.length) {
                            el.removeAttribute('class');
                          }
                        }else {
                          el.classList.add(klass);
                        }
                        return el;
                      });
                    });
                  }).pure();
                }),
                (function(tggl, query) {
                  return function toggle(klass) {
                    return tggl.run(klass).ap(query);
                  }
                })
              ),
              (function display(elem) {
                return function(display) {
                  elem.style.display = typeof display != 'undefined' ? (display === false || display == 'none' ? 'none' : 'block') : (elem.style.display != 'none' ? 'none' : '');
                  return elem;
                }
              }),
              (function attach(elem) {
                return function(parent) {
                  if (elem.getAttribute('data-pos') == 'pre') {
                    if (parent.firstChild) {
                      parent.insertBefore(elem, parent.firstChild);
                    }else {
                      parent.append(elem);
                    }
                  }else {
                    parent.append(elem);
                  }
                  return elem;
                }
              }),
              (function append(parent) {
                return function(elem) {
                  return elem.map(function(el) {
                    parent.append(el instanceof Element ? el : (el.$el || el.el));
                    return el;
                  });
                }
              })
            ],
            factory: {
              elements: {
                create: {
                  method: 'bind',
                  bind: 'Cont'
                },
                attrs: {
                  args: [],
                  method: 'lift',
                  lift: 'Maybe'
                },
                query: {
                  method: 'bind',
                  bind: 'Maybe'
                },
                find: {
                  args: [ 'utils.curry as curry' ],
                  method: 'bind',
                  bind: 'Maybe'
                },
                attach: {
                  method: 'lift',
                  just: 'IO',
                  bind: 'Cont',
                  lift: 'Maybe'
                },
                toggle: {
                  args: []
                }
              }
            }
          };
        }),                
    // === js.nodes === //
        (function() {
          return {
            type: 'IO',
            path: 'js',
            nodes: [
              (function lookup(make) {
                return function lookup(node) {
                  return make(typeof node == 'string' ? sys.get(node) : node);
                }
              })(
                (function make(node) {
                  return function(key) {
                    return node.lookup(key);
                  }
                })
              ),
              (function fn(node) {
                return function() {
                  var args = Array.prototype.slice.call(arguments);
                  if (args.length == 1) {
                    return node.func(args.shift());
                  }else {
                    return node.root.get('utils.obj')(args)(args.map(function(name) {
                      return node.fn(name);
                    }));
                  }
                }
              })
            ],
            factory: {
              nodes: {
                defaults: {
                  method: 'just',
                  just: 'IO',
                  bind: 'Cont'
                }
              }
            }
          };
        }),
    // === io.request === //
        (function() {
          return {
            type: 'IO',
            path: 'io',
            request: [
              (function style(src) {
                var fullsrc = src.split('.').append('css').slice(0, 2).join('.');
                var headref = document.getElementsByTagName('head').item(0);
                var fileref = headref.querySelector('[href="'+fullsrc+'"]');
                if (!fileref) {
                  fileref = document.createElement('link');
                  fileref.setAttribute('rel', 'stylesheet');
                  fileref.setAttribute('type', 'text/css');
                  fileref.setAttribute('href', fullsrc);
                  headref.appendChild(fileref);
                }
                return fileref;
              }),
              (function timeout(base) {
                return base.curry(function(fn, ms) {
                  return function(value) {
                    return ms ? self.setTimeout(function() {
                      fn(value);
                    }, ms) : fn(value);
                  };
                });
              })
            ],
            factory: {
              request: {
                defaults: {
                  method: 'just',
                  just: 'IO',
                  bind: 'Cont'
                },
                datalink: {
                  script: {

                  }
                },
                script: {
                  args: []
                },
                style: {
                  method: 'bind',
                  bind: 'Cont'
                },
                timeout: {
                  args: [ 'utils.curry as curry' ]
                }
              }
            }
          };
        }),
    // === sys.loader === //
        (function() {
          return {
            type: 'IO',
            path: 'sys',
            loader: [
              (function makeDetector(run) {
                return function detect(def, get) {
                  return run(def, get);
                }
              })(
                (function detect(def, key) {
                  var parts = def.name.split('.');
                  parts.push(parts.last());
                  var search = parts.join('/');
                  var script = Array.prototype.concat.apply([],
                  document.getElementsByTagName('head').item(0).getElementsByTagName('script')).filter(function(s) {
                    return s.src.indexOf(search) >= 0;
                  });
                  var result = script.length ? sys.find(script.first().getAttribute('data-ref')) : sys.get('assets').get(def.name);
                  return result && key ? result.get(key) : result;
                })
              ),
              (function makeEnqueue(makeWrap, makeOf, makeBind, makeSetRes, makeResult) {
                return function enqueue() {
                  var eff = this.get('sys.eff');
                  return makeWrap(makeOf({
                    components: eff('sys.loader.component').init(),
                    styles: eff('io.request.style').init(),
                    css: eff('io.request.style').init(),
                    pure: this.fn.pure
                  }, this.klass('Obj'), makeBind, makeSetRes, makeResult), this.klass('Obj'), eff('sys.loader.detect').init());
                }
              })(
                (function makeWrap(of, obj, detect) {
                  return function enqueue(def, run, force) {
                    var store = detect.run(def);
                    var cont  = store ? store.get('cont') : null;
                    if (!cont || force) {
                      cont = store.set('cont', of(def, run, obj.of({})));
                      cont.name = def.name;
                      cont.ref  = store.uid();
                    }
                    return cont;
                  };
                }),
                (function makeOf(eff, obj, bind, set, wrap) {
                  return function(def, run, res) {
                    def.deps.name = def.name;
                    return obj.of(def.deps).bind(bind(eff, set, res)).cont().bind(wrap(run));
                  }
                }),
                (function makeBind(eff, set, r) {
                  return function(x, v, k, i, o, l, a) {
                    if (l > 0) {
                      return typeof o == 'string' ? (a.parent = v) : (x[o[k]] = v);
                    }else if (k == 'name') {
                      x[k] = v;
                    }else if (k.match(/(parent|components|modules|types|system)/)) {
                      var val = v instanceof Array ? v : [ v ];

                      var loc = k == 'parent' ? (o.name.indexOf('modules') === 0 && o.name.indexOf('components') < 0 ? 'modules' : 'components') : k;
                      return val.map(function(def, type) {
                        var args = def instanceof Array ? def : [ def ];
                        var name = args.shift(), opts = args.length ? args.shift() : { js: true };
                        var code = name.replace(/\./g, '/'), path;
                        if (name.indexOf('modules') === 0) {
                          path = code.split('/').insert(-1, loc).append(code.split('/').pop()).join('/');
                        }else {
                          path = loc + '/' + (code.indexOf('/') > 0 ? code : (code + '/' + code));
                        }
                        return eff.components.run(path).cont();
                      });
                    }else if (k == 'core' || k == 'helpers' || k == 'config') {
                      return v.map(function(name) {
                        return name == 'pure' ? sys.store('sys.$fn.pure')(sys.pure())
                          : eff.components.run(k + '/' + name).cont();
                      });
                    }else if (k == 'scripts' || k == 'json' || k == 'css' || k == 'styles' || k == 'templates') {
                      return v.map(function(name) {
                        var path = name.split('/'), cont, isComp = path.first().match(/(modules|components)/);
                        if (k == 'templates' || k == 'css' || k == 'json') {
                          if (name == 'tmpl' && o.name.indexOf('.') > 0 && (path = o.name.split('.')))
                            path = path.append(path.last());
                          else if (k == 'css' && o.name.indexOf('.') > 0)
                            path = o.name.split('.').append(name);
                          else if (k == 'css' || k == 'json' || (name == 'tmpl' && o.name && (name = o.name)))
                            path = name.indexOf('modules') === 0 ? [ name, name.split('.').pop() ] : [ 'components', name, name ];
                          else if (path.length < 2) path.unshift('templates');
                          path.push(path.pop()+(k == 'templates' ? '.tmpl' : ('.' + k)));
                        }else {
                          if (path.length < 2) path.unshift('libs');
                          if (path.length < 3) path.push(name);
                        }
                        return (eff[k] || eff['components']).run(path.join('/')).cont();
                      });
                    }
                    return v;
                  };
                }),
                (function makeSetRes(res, name) {
                  return function(result) {
                    return function $_pure(k) {
                      return k((res[name] = result));
                    }
                  }
                }),
                (function(make, run, wrap, parent, result) {
                  return wrap(parent, result, make(sys.get('utils.get'), run, sys.klass('Maybe').of), sys.klass('Cont'), sys.klass('Value'));
                })(
                  (function make(get, run, sys) {
                    return function(deps) {
                      return run(get(deps), sys);
                    }
                  }),
                  (function run(get, of) {
                    return function() {
                      var args = [].slice.call(arguments);
                      if (!args.length) return get();
                      var path = args.flat().join('.').split('.');
                      var type = path[0].substr(0, 1) == '$' && path.shift() ? of : unit;
                      if (path.length == 1) return type(get(path.shift()));
                      var name = path.pop();
                      var base = get(path.join('.'));
                      if (base) return type(base[name] || base[name.replace('-', '.')] || base[(name.indexOf('$') < 0 ? ('$' + name) : name.replace('$', ''))]);
                    }
                  }),
                  (function wrap(parent, result, wrap, cont, value) {
                    return function makeResult(run) {
                      return function(deps) {
                        if (deps.parent) {
                          if (cont.is(deps.parent) || value.is(deps.parent)) {
                            return deps.parent.bind(parent(result(wrap, run), deps));
                          }else {
                            return parent(result(wrap, run), deps)(deps.parent)(unit);
                          }
                        }else {
                          return result(wrap, run)(deps);
                        }
                      }
                    }
                  }),
                  (function makeParent(run, deps) {
                    return function(parent) {
                      return function $_pure(k) {
                        var prtdeps = parent.ctor.prop('deps')();
                        deps.parent = parent;
                        deps.extend(prtdeps, true);
                        if (deps.templates && deps.templates.tmpl) {
                          if (prtdeps.templates && prtdeps.templates.tmpl) {
                            var tmpl = deps.templates.tmpl;
                            prtdeps.templates.tmpl.map(function(v, k) {
                              if (!tmpl.has(k)) tmpl.set(k, v);
                            });
                          }
                        }
                        return k(run(deps));
                      }
                    }
                  }),
                  (function makeResult(wrap, run) {
                    return function(deps) {
                      var res = run();
                      var dep = res.deps = wrap(deps);
                      if (res.init) {
                        res = res.init(dep);
                      }
                      if (res.schema) {
                        sys.get('schema.$app').parse(res.schema, 2);
                      }
                      if (deps.parent) {
                        res.parent = deps.parent;
                      }
                      if (!deps.name || deps.name.substr(0, 4) != 'core') {
                        if (!res.name) res.name = deps.name;
                        if (!res.deps) res.deps = dep;
                        if (!res.alias && deps.alias) res.alias = deps.alias;
                      }
                      return res;
                    }
                  })
                )
              ),
              (function(wrap, parse, eng, obj) {
                var base = { obj: sys.klass('Obj'), bind: sys.get('binds.make') };
                var link = sys.get('link').make('parser', 'valueMap', parse.call(base)).add('parser', {}, 'base');
                sys.get('link').make('loader', 'valueMap', obj.call(sys)).add('loader', {}, 'base');
                sys.get('link').make('engine', 'valueMap', eng.call(sys)).add('engine', {
                  base: 'loader', tmpl: 'request', templates: 'request'
                }, 'base').add('handler', {
                  components: 'extend', modules: 'extend', system: 'extend',
                  types: 'extend', tmpl: 'tmpl', json: 'json', config: 'json', templates: 'tmpl'
                }, 'unit').add('scripts', {
                  'tmpl':  {}, 'style': {}
                });
                return wrap(link.run('loader').free());
              })(
                (function(loader) {
                  return function base(ref) {
                    return ref ? loader.cont(ref) : loader;
                  }
                }),
                (function() {
                  return this.obj.of({
                    loader: {
                      make: function(map) {
                        return function(ref) {
                          if (!ref.v || !ref.v.done) {
                            if (ref.$keys) {
                              ref.v = map.run(ref.v, ref.$keys.shift());
                            }else if ((ref = map.run(ref, 'init'))) {
                              if (!ref.v.done) {
                                return this.next(ref);
                              }
                            }
                          }
                          if (ref.v.done) {
                            return this.done(ref.a.create && ref.v.create ? ref.v.create({ name: ref.a.create.name, ref: ref.a.create.ref || ref.a.ref }).pure() : ref.v.cont);
                          }
                          return this.cont(ref);
                        }
                      },
                      $make: function() {
                        return this._make || (this._make = sys.klass('Coyoneda').of(this.make));
                      },
                      $data: function() {
                        return this._data || (this._data = sys.get('loader').link('valueMap').run('base'));
                      },
                      free: function() {
                        return sys.klass('Free').extend(function FreeL(f, x, t) {
                          this.$$init(f, x, t);
                        }, {
                          run: function(f) {
                            return this[this._t].enqueue(this._x.chain(this.$fn.map(f)));
                          }
                        }).of(this.$make()).lift(this.$data());
                      }
                    },
                    parse: this.bind('object')('fold', function(r, v, k, i, o) {
                      if (typeof v == 'object') r.set(k, v);
                    })
                  });
                }),
                (function() {
                  return {
                    unit: this.run().fn.$const(unit),
                    request: this.klass('Cont').extend(
                      function RequestCont(mv, mf) {
                        this.$super(mv, mf);
                      }, {
                        mf: function(loc) {
                          return sys.get('async.request')(loc);
                        }
                      }, {
                        of: function(loc, res) {
                          return new this(loc).run(res);
                        }
                      }
                    ).$ctor,
                    loader: this.klass('Cont').extend(
                      function ComponentCont(mv, mf) {
                        this.$super(mv, mf);
                      }, {
                        mf: function mf(tag) {
                          return function $_pure(k) {
                            var store = sys.find(tag.getAttribute('data-ref'));
                            if (store.get('js.isDefined')) {
                              store.get('js').get(k);
                            }else if (!store.has('cont')) {
                              k(sys.klass('Cont').of(store.get('ref.cont')));
                            }else {
                              k(store.get('cont'));
                            }
                          };
                        }
                      }, {
                        of: function(loc, res) {
                          if (loc == 'pure') {
                            return this.prototype._.of(sys).run(res);
                          }else if (loc.lazy) {
                            var cont = new this(sys.get('async.script')(loc));
                            cont.attr('ref', loc.ref);
                            cont.attr('url', loc.url);
                            cont.attr('name', loc.url.split('.').shift().split('/').pop());

                            return cont.$value().run(res);
                          }else {
                            var cont = new this(sys.get('async.script')(loc));
                            return cont.run(res);
                          }
                        }
                      }
                    ).$ctor,
                    extend: (function(ext) {
                      var xtnd = sys.store('utils.extend');
                      var deps = sys.klass('Deps');
                      return function(store) {
                        return ext(xtnd, deps, store.get('init.v.comp'));                                      
                      }
                    })(
                      (function extend(xtnd, deps, comp) {
                        return function $ext(result) {
                          if (result == comp.$ctor) return comp.$flush().$ctor;

                          if (!result.ext) result.ext = {};
                          if (result.klass) {
                            comp = comp.$overload(result.klass);
                          }else if (result.alias) {
                            comp = comp.$overload(comp.named(result.alias));
                          }

                          var base, conf, parent, relinked;

                          if (result.parent) {
                            parent = result.parent.ctor;
                            comp._parent = parent.$code;
                            comp.$store.ref().clear(comp.$code);
                            relinked = comp.add();
                            parent.set(comp.$code, comp.$store);
                            comp.$store.ref(parent.$store);
                            comp._level = parent._level + 1;

                            base = xtnd({}, parent.prop('conf'));
                            Object.keys(parent.proto()).exclude(comp.proto(), result.ext, 'deps', 'conf').map(function(prop) {
                              result.ext[prop] = parent.prop(prop);
                            });
                          }else {
                            base = {};
                          }
                          if (result.deps) {
                            if (result.ext instanceof Array) {
                              result.ext.push({ name: 'deps', value: deps.of(result.deps) });
                            }else if (result.deps) {
                              result.ext.deps = deps.of(result.deps);
                            }
                          }
                          comp.ext(result.ext);

                          conf = comp.prop('conf', comp.update(base, comp.prop('conf'), true));
                          if (result.events) {
                            conf.events  = comp.update(conf.events,  result.events, true);
                          }
                          if (result.proxy) {
                            conf.proxy   = comp.update(conf.proxy,   result.proxy, true);
                          }
                          if (result.control) {
                            conf.control = comp.update(conf.control, result.control, true);
                          }
                          if (result.opts) {
                            conf.opts    = xtnd(xtnd({}, conf.opts    || {}), result.opts);
                          }else {
                            conf.opts    = xtnd({}, conf.opts || {});
                          }
                          if (result.data) {
                            conf.data    = xtnd(xtnd({}, conf.data    || {}), result.data);
                          }else {
                            conf.data    = xtnd({}, conf.data || {});
                          }
                          if (result.tmpl) {
                            xtnd(conf.data || (conf.data = {}), { tmpl: result.tmpl });
                          }
                          if (result.$init) {
                            result.$init.call(comp.root(), result, comp, comp.sys());
                          }
                          return comp.$flush().$ctor;
                        };
                      })
                    ),
                    tmpl: function(node, meta) {
                      return function(template) {
                        var elem = document.createElement('div');
                        elem.innerHTML = template;
                        var store = node.node('data').store(), ref;
                        var $curr, $prev, $node, $uid = node.cid();
                        while (elem.firstElementChild && (ref = elem.firstElementChild)) {
                          $curr = ref.id == 'style' ? 'style' : (ref.getAttribute('data-type') || 'tmpl');
                          if ($curr != $prev) $node = meta.get($curr);
                          store.set(ref.id, ref.innerHTML.trim()); elem.removeChild(ref);
                          $node.push($uid, ref.id, true);
                        };
                        return store;
                      }
                    },
                    json: function(node, meta) {
                      return function(result) {
                        return node.klass('Obj').of(result ? result.json : {});
                      }
                    }
                  };
                }),
                (function() {
                  return this.klass('Obj').of({
                    base: {
                      run: function(r, k) {
                        var v = this.root().get(k);
                        if (v instanceof Function) {
                          r = v(r);                             
                        }else if (typeof v == 'object') {
                          if (v.$$map) {
                            r = v.$$map(r);
                          }else if (r.$$map) {
                            r = r.$$map(r);
                          }else if (v.base) {
                            r = v.base(r);
                          }
                        }
                        return r;
                      }
                    },
                    init: {
                      init: function(ref) {
                        return {
                          v: { ref: ref.ref || ref },
                          a: typeof ref == 'object' ? ref : { ref: ref }
                        };
                      },
                      node: function(path) {
                        return sys.get('assets').get(path) || sys.get('assets').ensure(path)
                      },
                      path: function(type, path) {
                        if (type == 'tmpl' && path.length > 3) {
                          return path.map(function(p) {
                            return p == 'components' ? 'tmpl' : p;
                          }).slice(0, -1);
                        }else {
                          return type == 'libs' || type == 'json' || type == 'tmpl' ? path.slice(0, 2) : path;
                        }
                      },
                      type: function(v) {
                        v.full = v.ref.replace('.json', '/json').split('.');
                        v.path = v.full.first().split('/');
                        v.name = v.full.length > 3 ? v.full.pop() : v.path.last();
                        v.ext  = (v.full.length > 1 || v.full.push('js')) && (v.path.first() == 'components' && v.path.last() == 'json' ? v.path.pop() : v.full.last());
                        if (v.path.first() == 'templates') {
                          v.type = v.path.first();
                        }else if (v.path.length > 3 && v.ext == 'tmpl') {
                          v.type = v.ext;
                        }else if (v.ext == 'tmpl' || v.ext == 'json') {
                          v.type = v.ext;
                          v.path = [ v.type ].concat(v.path.slice(1));
                        }else if (v.path.first() == 'modules') {
                          v.type = v.path.indexOf('components') > 0 ? 'components' : 'modules';
                        }else {
                          v.type = v.path.first();
                        }
                        return v.node = this.node(this.path(v.type, v.path.join('/').replace(/\$/g, '').split('/')));
                      },
                      next: function(i, v) {
                        v.loca = v.path.length >= 3
                          || v.type == 'core' || v.type == 'helpers' || v.type == 'modules'
                          || v.type == 'libs' || v.type == 'templates' || v.type == 'tmpl'
                          ? v.ref : [ v.type, v.name, v.name ].join('/');
                        v.name  = v.node.set('type', v.name.toCamel());
                        i.$keys = this.root().keys().slice(2);
                        return i;
                      },
                      done: function(node, init, base, ref) {
                        if (init) {
                          return init.v.done ? { a: ref, v: init.v } : init;
                        }else {
                          return node.set('init', this.next(base, base.v));
                        }
                      },
                      base: function(ref) {
                        var base = this.init(ref);
                        var node = this.type(base.v);
                        return this.done(node, node.get('init'), base, ref);
                      }
                    },
                    ctor: {
                      $$map: function(v) {
                        v.ctor = this[v.type] || this['base'];
                        return v;
                      },
                      base: 'Component',
                      modules: 'Module',
                      system: 'System',
                      types: 'Types',
                      config: 'Obj'
                    },
                    comp: {
                      base: function(v) {
                        if (v.type == 'components' || v.type == 'modules' || v.type == 'system') {
                          var ctor = sys.klass(v.ctor);
                          if (!ctor) ctor = sys.klass('$ctor').extend(v.ctor);
                          v.comp = ctor.extend(v.name);
                        }
                        return v;
                      }
                    },
                    cell: {
                      cell: this.klass('Cell').of,
                      cont: this.klass('Cont').$ctor,
                      vmap: this.get('link.idx.valueMap'),
                      vals: this.klass('Value'),
                      next: function(cont, cell, map, value) {
                        return function $set(result) {
                          if (cont.is(result)) {
                            result.run($set);
                          }else if (value.is(result)) {
                            cell.set(result.resolve(cont.is, map));
                          }else {
                            cell.set(map(result));
                          }
                        }
                      },
                      base: function(v) {
                        var cell = v.node.get(v.ext);
                        var lazy = v.path.last().slice(0, 1) == '$' ? true : false;
                        var loca = v.cell = (lazy ? '$' : '') + v.ext;
                        if (!cell) {
                          cell = v.node.get(loca);
                          if (!cell) {
                            cell = v.node.set(loca, this.cell());
                            this.vmap.run('engine', v.type).of({
                              url: v.loca,
                              ref: v.node.uid(),
                              lazy: lazy
                            }, this.next(
                              this.cont,
                              cell,
                              this.vmap.run('handler', v.type)(v.node, this.meta || (this.meta = this.vmap.get('scripts.map'))),
                              this.vals
                            ));
                          }
                        };
                        return v;
                      }
                    },
                    result: {
                      make: function(comp, cont) {
                        return function() {
                          var args = [].slice.call(arguments), opts, inst, loca, base, ref;
                          if (typeof args.first() == 'object') {
                            opts = args.shift();
                          }else {
                            opts = { name: args.shift() };
                          }
                          if (args.length) opts.parent = args.shift();
                          if (!opts.parent) {
                            base = sys.get('components');
                            ref  = opts.ref || comp.get('info.ref');
                            loca = ref.split('/').slice(1, -2);
                            opts.parent = loca.length ? base.get(loca) : base;
                          }
                          inst = comp.$ctor.of(opts);
                          return inst.make(cont);
                        };
                      },
                      base: function(v) {
                        var cont = v.node.get(v.cell).kont(), create;
                        if (v.comp) {
                          create = cont.create || (cont.create = (v.comp.$ctor.create || (v.comp.$ctor.create = this.make(v.comp, cont))));
                          v.comp.set('info', Object.keys(v).reduce(function(r, k) {
                            if (typeof v[k] == 'string') r[k] = v[k];
                            return r;
                          }, {}));
                        }
                        return v.node.set('ref', { done: true, create: create || false, cont: cont.cont() });
                      }
                    }
                  });
                })
              ),
              (function(wrap, lifter) {
                return function component() {
                  return wrap(this.eff('sys.loader.base').init());
                }
              })(
                (function(base) {
                  return function component(ref, create) {
                    return base.run(typeof ref == 'object' ? ref : {
                      ref: ref,
                      create: create ? (typeof create === 'object' ? create : { name: create }) : false
                    });
                  }
                }),
                (function() {
                  return this.lift(function(base, handler) {
                    return this.fx(function(value) {
                      return base.bind('object')('fold', function() {
                        return console.log([].slice.call(arguments));
                      });
                    });
                  });
                })
              ),
              (function module(name, create) {
                return sys.eff('sys.loader.component').run(['modules',name,name].join('/'), create)
              })
            ],
            factory: {
              loader: {
                defaults: {
                  method: 'just',
                  just: 'IO',
                  lift: 'Maybe',
                  bind: 'Cont'
                },
                enqueue: {
                  args: []
                },
                component: {
                  args: []
                }
              }
            }
          };
        })

  ))

);
