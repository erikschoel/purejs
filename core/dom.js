define(function() {

  return this.enqueue({

    name: 'core.dom',

    deps: {

      core: [ 'pure' ],

      scripts: [ 'bezier', 'doT' ]

    }

  }, function() {

    return {

      init: function(deps) {
        return deps('core.pure')(function(sys) {
          return function(dom) {
            var doT    = sys.eff('sys.eff.parse').run(dom.doT.call(dom.deps('scripts.doT')));
            var eff    = sys.eff('sys.eff.parse').run(dom.eff);
            var calc   = eff.ensure('dom.calc');
            var node   = calc.node('bezier').parse(dom.easing);
            var makefn = calc.set('makefn', dom.deps('$.scripts.$bezier').chain(function(fn) {
              return fn;
            }));
            return { makefn: makefn };
          }
        })(this);
      },

      doT: function() {
        return {
          type: 'IO',
          path: 'dom',
          elements: [
            (function($doT) {
              return function template(str, attr) {
                return $doT.compile(str, attr);
              }
            })(this)
          ],
          factory: {
            elements: {
              defaults: {
                method: 'just',
                just: 'IO',
                lift: 'Maybe',
                bind: 'Cont'
              },
              template: {
                method: 'just',
                bind: 'IO',
                lift: 'Maybe'
              }
            }
          }
        };
      },

      easing: {
        'ease-in-out'      : [ 0.420, 0.000, 0.580, 1.000 ],
        'ease-in'          : [ 0.420, 0.000, 1.000, 1.000 ],
        'ease-out'         : [ 0.000, 0.000, 0.580, 1.000 ],
        'ease'             : [ 0.250, 0.100, 0.250, 1.000 ],
        'swing'            : [ 0.020, 0.010, 0.470, 1.000 ],
        'easeInBack'       : [ 0.600,-0.280, 0.735, 0.045 ],
        'easeInCirc'       : [ 0.600, 0.040, 0.980, 0.335 ],
        'easeInCubic'      : [ 0.550, 0.055, 0.675, 0.190 ],
        'easeInExpo'       : [ 0.950, 0.050, 0.795, 0.035 ],
        'easeInOutBack'    : [ 0.680,-0.550, 0.265, 1.550 ],
        'easeInOutCirc'    : [ 0.785, 0.135, 0.150, 0.860 ],
        'easeInOutCubic'   : [ 0.645, 0.045, 0.355, 1.000 ],
        'easeInOutExpo'    : [ 1.000, 0.000, 0.000, 1.000 ],
        'easeInOutQuad'    : [ 0.455, 0.030, 0.515, 0.955 ],
        'easeInOutQuart'   : [ 0.770, 0.000, 0.175, 1.000 ],
        'easeInOutQuint'   : [ 0.860, 0.000, 0.070, 1.000 ],
        'easeInOutSine'    : [ 0.445, 0.050, 0.550, 0.950 ],
        'easeInQuad'       : [ 0.550, 0.085, 0.680, 0.530 ],
        'easeInQuart'      : [ 0.895, 0.030, 0.685, 0.220 ],
        'easeInQuint'      : [ 0.755, 0.050, 0.855, 0.060 ],
        'easeInSine'       : [ 0.470, 0.000, 0.745, 0.715 ],
        'easeOutBack'      : [ 0.175, 0.885, 0.320, 1.275 ],
        'easeOutCirc'      : [ 0.075, 0.820, 0.165, 1.000 ],
        'easeOutCubic'     : [ 0.215, 0.610, 0.355, 1.000 ],
        'easeOutExpo'      : [ 0.190, 1.000, 0.220, 1.000 ],
        'easeOutQuad'      : [ 0.250, 0.460, 0.450, 0.940 ],
        'easeOutQuart'     : [ 0.165, 0.840, 0.440, 1.000 ],
        'easeOutQuint'     : [ 0.230, 1.000, 0.320, 1.000 ],
        'easeOutSine'      : [ 0.390, 0.575, 0.565, 1.000 ],
        'linear'           : [ 0.250, 0.250, 0.750, 0.750 ]
      },

      eff: (function() {
        return {
          type: 'IO',
          path: 'dom',
          elements: [
            (function(type) {
              return function animate() {
                return type.call(this);
              }
            })(
              (function() {
                return this.klass('IO').parse({
                  klass: function Anim(x) {
                    this.$super(x);
                  },
                  ext: {
                    itid: (function itid(cnt) {
                      return function() {
                        return cnt.itid++;
                      }
                    })({ itid: 1000 }),
                    createEnqueue: function(queue) {
                      return function(items, func) {
                        queue.run(items, func);
                      }
                    },
                    createBaseItem: this.get('utils.extend'),
                    createItemWrap: function(item, extend, parser, updater, easing, perc) {
                      var func = item.fn ? updater.run(item.fn) : unit;
                      return function(value) {
                        var duration = perc(item.duration, value.duration);
                        var easingfn = value.easing || item.easing;
                        return parser({
                          id:       item.itid(),
                          count:    0,
                          fn:       value.fn ? updater.run(value.fn) : func,
                          ease:     easingfn ? easing.run(easingfn) : unit,
                          klass:    value.klass || item.klass || false,
                          prop:     value.prop || item.prop, 
                          from:     value.from || item.from || 0,
                          to:       value.to   || item.to || 0,
                          value:    value.value || item.value,
                          fraction: item.fraction,
                          toggle:   value.toggle === false ? false : (item.toggle === true),
                          init:     value.init   === false ? false : (item.init   === true),
                          duration: duration,
                          delay:    perc(duration, value.delay || item.delay),
                          times:    value.times || item.times || 0,
                          factor:   value.factor || item.factor || 0,
                          step:     value.step, $step: item.step || 0.1,
                          tstart:   0,
                          ts:       0,
                          prevts:   0,
                          last:     false,
                          done:     false,
                          elem:     value.elem || value
                        });
                      };
                    },
                    defaultPercer: function(duration, value) {
                      if (value && typeof value == 'string' && value.indexOf('%') > 0) {
                        return (parseInt(value.replace(/[^0-9\.]/g, ''))/100)*duration;
                      }else {
                        return value || duration;
                      }
                    },
                    defaultParser: function(item) {
                      var style = self.getComputedStyle(item.elem);
                      if (item.value == 'prop') {
                        item.$from = parseInt(
                          item.elem && item.elem.style
                          ? (item.elem.getAttribute('data-from-' + item.prop)
                            || item.elem.setAttribute('data-from-' + item.prop,
                              style[item.prop].replace(/[^0-9\.]/g, ''))
                            || item.elem.getAttribute('data-from-' + item.prop))
                          : item.from);
                        item.$to = item.$from == item.from ? item.to : item.from;
                      }else {
                        if (typeof item.from == 'string') {
                          if (item.from == 'prop') item.from = item.prop;
                          item.$from = parseInt(
                            item.elem && item.elem.style
                            ? (item.elem.getAttribute('data-from-' + item.from)
                              || item.elem.setAttribute('data-from-' + item.from,
                                style[item.from].replace(/[^0-9\.]/g, ''))
                              || item.elem.getAttribute('data-from-' + item.from))
                            : 0);
                        }else item.$from = item.from;
                        if (typeof item.to == 'string') {
                          if (item.to == 'prop') item.to = item.prop;
                          item.$to = parseInt(
                            item.elem && item.elem.style
                            ? (item.elem.getAttribute('data-to-' + item.to)
                              || item.elem.setAttribute('data-to-' + item.to,
                                style[item.to].replace(/[^0-9\.]/g, ''))
                              || item.elem.getAttribute('data-to-' + item.to))
                            : 0);
                        }else item.$to = item.to;
                        if (item.value == 'from' && item.$from == item.from) {
                          item.elem.style[item.prop] = item.fn(item.$from);
                        }
                      }
                      item.$init   = item.init;
                      item.$times  = item.times;
                      item.$factor = item.factor;
                      item.value   = item.prev = item.$from;
                      item.diff    = item.$to - item.$from;
                      item.posneg  = item.$from < item.$to ? 1 : -1;
                      item.abs     = item.diff*item.posneg;
                      item.round   = item.abs < 10 ? 1000 : 100;
                      item.step    = item.step || (1 / item.round);
                      return item;
                    },
                    createTemplateWrap: function(enqueue, lazy) {
                      return function(template, parser) {
                        return lazy.createRunWrap(
                          lazy, enqueue, lazy.createItemWrap(
                            lazy.createBaseItem({
                              id: lazy._id, itid: lazy.itid, init: true, ts: 0, prevts: 0,
                              $from: 0, $to: 0, fraction: 0, duration: 0, delay: 0,
                              toggle: true, tstart: 0, done: false }, template),
                            lazy.createBaseItem,
                            parser || lazy.defaultParser,
                            sys.eff('dom.elements.updater'),
                            sys.eff('dom.easing.make').init(),
                            lazy.defaultPercer
                          )
                        );
                      }
                    },
                    createRun: function(thread, args) {
                      return function $_pure(continuation) {
                        return thread.run(args.map(function(v) {
                          if (v.klass) {
                            if (v.$from == v.from) {
                              v.elem.classList.add('anim-start');
                            }
                            v.elem.classList.remove('anim-done');
                          }
                          return v;
                        }), continuation);
                      }
                    },
                    createRunWrap: function(anim, thread, makeItem) {
                      return function() {
                        return anim.createRun(thread.lift(), [].slice.call(arguments).flat().map(makeItem));
                      }
                    },
                    createToggle: function(msdef) {
                      return this.nest().lift(function(anim, ms) {
                        anim.run(function() {
                          anim.delay(ms || msdef || 300);
                        });
                        return anim;
                      });
                    }
                  },
                  init: function(type, klass, sys) {
                    var $ctor = klass.$ctor;
                    var $pure = $ctor.$pure = klass.parent().get('type.$ctor').pure.bind($ctor);
                  }
                }).of(function $_anim(val) {
                  val.prevts  = val.ts;
                  val.prevlap = val.elapsed;
                  val.elapsed = (val.ts = parseInt(self.now())) - (val.tstart || (val.tstart = (val.ts + val.delay)));
                  if (val.elapsed > 0 || ((val.times == val.$times && val.init))) {
                    val.fraction = val.init ? 0 : (val.elapsed / val.duration);
                    if (val.fraction >= 1) {
                      val.fraction = 1;
                      val.done     = val.last;
                      val.last     = true;
                      val.value    = val.$to;
                    }else {
                      val.init     = false;
                      val.value    = parseInt((val.$from + (val.ease(val.fraction) * val.diff))*val.round)/val.round;
                      if (val.klass) val.elem.classList.add('anim-running');
                    }
                    if ((!val.count++ && val.$init) || (val.last && (val.done = true)) || ((val.value - val.prev) * val.posneg) > val.step) {
                      //console.log('!UPDATE!', { fs: val.ts - val.prevts, prop: val.prop, prev: val.prev, val: val.value, step: val.step });
                      val.elem.style[val.prop] = val.fn((val.prev = val.value));
                      if (val.count == 2 && val.klass) val.elem.classList.remove('anim-start');
                    }
                  }
                  if (!val.done) {
                    return true;
                  }else {
                    //console.log('!DONE!', { id: val.id, count: val.count, fs: val.ts - val.prevts, prop: val.prop, prev: val.prev, val: val.value, step: val.step });
                    val.done    = false;
                    val.init    = val.$init;
                    val.last    = false;
                    val.tstart  = 0;
                    val.elapsed = 0;
                    if (val.toggle) {
                      val.$to    = val.$from;
                      val.$from  = val.value;
                      val.diff   = val.diff * -1;
                      val.posneg = val.posneg * -1;
                    }else {
                      val.value  = val.prev = val.$from;
                    }
                    if (val.$times) {
                      if (val.times && --val.times) {
                        if (val.factor) {
                          val.factor.keys().map(function(k) {
                            val[k] = val[k]*val.factor[k];
                          });
                        }
                        return true;
                      }else {
                        val.times = val.$times;
                      }
                    }
                    val.count = 0;
                    if (val.klass) {
                      val.elem.classList.remove('anim-running');
                      val.elem.classList.add('anim-done');
                      if (val.$from != val.from) val.elem.classList.add('anim-open');
                      else val.elem.classList.remove('anim-open');
                    }
                    return false;
                  };
                }).nest().lift(function(a, b) {
                  return a.createTemplateWrap(
                    sys.klass('Free').parse({
                      klass: function FreeA(f, x) {
                        this.$super(f, x);
                      },
                      ext: { _t: '$anim' },
                      init: function(type, klass, sys) {
                        klass.$ctor.list = klass.parent().$ctor.list;
                        klass.$ctor.raf  = klass.parent().$ctor.raf;
                      }
                    }).$ctor.raf(a.run()),
                  a)(b);
                });
              })
            ),
            (function make() {
              var elem  = this.eff('dom.elements.create').init('maybe', 'IO');
              var attrs = this.eff('dom.elements.attrs').init('just');
              return function make(tag) {
                return attrs.ap(elem(tag)).pure();
              }
            }),
            (function html(elem) {
              return function(content) {
                elem.innerHTML = content;
                return elem;
              }
            }),
            (function empty(elem) {
              while (elem.firstChild) {
                elem.removeChild(elem.firstChild);
              }
              return elem;
            }),
            (function render(tag) {
              var elem = document.createElement(tag);
              return function render(str) {
                elem.innerHTML = str || '';
                return elem.firstChild ? elem.removeChild(elem.firstChild) : elem;
              }
            }),
            (function tr() {
              var body = document.createElement('table').createTBody();
              return function tr(str) {
                body.innerHTML = str;
                return body.removeChild(body.firstChild);
              }
            }),
            (function style(str, ref) {
              if (!str) return;
              var idtfr = str.substr(0,50).replace(/[^A-Za-z\-]/g, '');
              var head  = document.getElementsByTagName('head').item(0);
              var style = head.querySelector('#'+idtfr);
              if (!style) {
                style = document.createElement('style');
                style.id = idtfr; style.type = 'text/css';
                style.innerHTML = str; head.appendChild(style);
                if (ref) style.setAttribute('data-ref', ref);
              }
              return style;
            }),
            (function css(elem) {
              var style = self.getComputedStyle(elem);
              return function(prop) {
                var value = style[prop];
                return parseInt(value.replace(/[^0-9\.]/g, '')||0);
              }
            }),
            (function rules(sheet) {
              return function(selector, index) {
                var rule = [].slice.call(sheet.rules).find(function(rule) {
                  return rule.selectorText == selector;
                });
                if (!rule) {
                  if('insertRule' in sheet) {
                    rule = sheet.rules.item(sheet.insertRule(selector + '{}', index || 0));
                  }
                  else if('addRule' in sheet) {
                    rule = sheet.addRule(selector, rules, index || 0);
                  }
                }
                return rule;
              }
            }),
            (function size() {
              var fn = this.eff('dom.elements.css').init();
              return function size(elem) {
                var css = fn.run(elem);
                var res = {
                  outerWidth: css('width'), outerHeight: css('height'),
                  paddingTop: css('paddingTop'), paddingRight: css('paddingRight'),
                  paddingBottom: css('paddingBottom'), paddingLeft: css('paddingLeft')
                };
                res.innerWidth  = res.outerWidth  - res.paddingLeft - res.paddingRight;
                res.innerHeight = res.outerHeight - res.paddingTop  - res.paddingBottom;
                return res;
              }
            }),
            (function(run, make) {
              return function styleinfo() {
                return run(make.call({
                  css: sys.eff('dom.elements.css').init(),
                  find: sys.eff('dom.elements.find').init('just')
                }));
              }
            })(
              (function styleinfo(base) {
                return function(elem) {
                  return base.ap(elem);
                }
              }),
              (function() { // !!!
                return this.find.nest().lift(function(find, css) {
                  return this.fx(function(elem) {
                    return find.ap(elem).to('io').run(css);
                  });
                }).run(this.css);
              })
            ),
            (function element(tagname, wrap, fix, run) {
              var base = sys.eff('dom.elements.make').run(tagname).run();
              var make = sys.klass('IO').of(fix).lift(run);
              var attr = sys.eff('dom.elements.attrs').init('just');
              var anim = sys.eff('dom.elements.animate').bind(function(a) {
                return a.fx(a.run({ duration: 150, easing: 'swing', toggle: true, klass: true, prop: 'opacity', from: 0, to: 1, value: 'from' })).map(a.constructor.$pure);
              });
              return wrap(base.nest().lift(function(i, o) {
                var v = o.attrs, p = o.props;
                var $el = v.$el = i.run(v);
                v.$set  = attr.to('io').run($el).ap(make.map(function(x) {
                  return x.attrs;
                }));
                if (p.anim) v.$anim = anim.run($el);
                if (p.toggle) v.$toggle = v.$anim.createToggle(p.toggle);
                if (p.run) {
                  if (v[p.run] && v[p.run].run) v[p.run].run();
                  p.run = '';
                }
                return v;
              }).ap(make), make.kid);
            }),
            (function alert(wrap, fix, run) {
              return function alert() {
                return sys.eff('dom.elements.element').run('div', wrap, fix, run);
              }
            })(
              (function(io, id) {
                return function alert(attrs) {
                  attrs || (attrs = {});
                  if (!attrs.uid) attrs.uid = id();
                  return io.run(attrs);
                }
              }),
              (function(value) {
                if (!value) return 'alert';
                else if (value.indexOf('alert') < 0) value = 'alert alert-'+value;
                return value.toLowerCase().replace(/[^0-9\sa-z]/g, '-').replace(/-{2,}/g, '-');
              }),
              (function(fix, vals) {
                var value  = typeof vals == 'object' ? vals : { type: vals };
                var attrs  = { 'className' : fix(value.type || value['class']) };
                var props  = {};
                attrs.id   = 'AL' + vals.uid;
                attrs.text = value.text || value.innerText || value.innerHTML || value.name || value.value || '';
                if (value.value) attrs.value = value.value;
                if (value.style) attrs.style = value.style === true ? 'opacity: 1' : value.style;
                else if (value.style === false) attrs.style = 'opacity: 0';
                if (value.anim || value.toggle) props.anim = value.anim || true;
                if (value.toggle) props.toggle = value.toggle;
                if (value.run) props.run = value.run;
                return { attrs: attrs, props: props };
              })
            ),
            (function button(wrap, fix, run) {
              return function button() {
                return sys.eff('dom.elements.element').run('button', wrap, fix, run);
              }
            })(
              (function(io, id) {
                return function button(attrs) {
                  attrs || (attrs = {});
                  if (!attrs.uid) attrs.uid = id();
                  return io.run(attrs);
                }
              }),
              (function(value) {
                if (!value) return 'btn';
                else if (value.indexOf('btn') < 0) value = 'btn-'+value;
                return value.toLowerCase().replace(/[^0-9a-z]/g, '-').replace(/-{2,}/g, '-');
              }),
              (function(fix, value) {
                var attrs   = { 'class' : 'btn btn-default' };
                var props   = {};
                attrs.text  = value.text || value.innerText || value.innerHTML || value.name || value.value;
                attrs.name  = fix(value.name || value.value || attrs.text);
                attrs.value = value.value || attrs.name;
                if (value.style) attrs.style = value.style;
                return { attrs: attrs, props: props };
              })
            ),
            (function updater(map) {
              function fx(type) {
                if (!type || type == 'unit') return unit;
                else if (type.type && map[type.type]) return map[type.type](type.args);
                else if (typeof type == 'object') return map['object'](type.tmpl, type.tmpl.length - type.tmpl.replace(/\%/g, '').length);
                else if (map[type]) return map[type];
                else if (typeof type == 'string' && type.indexOf('%') > -1) return map['custom'](type);
                return unit;
              };
              return function updater(type) {
                return fx(type);
              };
            })({
              px: (function() {
                var p = '%px'.valueOf();
                return function(value) {
                  return p.replace('%',value);
                }
              })(),
              pct: (function() {
                var p = '%%'.valueOf();
                return function(value) {
                  return p.replace('%',value);
                }
              })(),
              rgb: (function() {
                var p = 'rgb(%,0,255)'.valueOf();
                return function(value) {
                  return p.replace('%',parseInt(value));
                }
              })(),
              object: function(p, n) {
                var i = 0, v = p;
                return function(value) {
                  v = v.replace('%',value);
                  if (++i == n) {
                    return unit(v, (v = p), (i = 0));
                  }else {
                    return v;
                  }
                }
              },
              custom: function(p) {
                return function(value) {
                  return p.replace('%',value);
                }
              },
              func: function(n) {
                var args = [];
                return function(fn) {
                  return function(value) {
                    if (args.push(value) < n) {
                      return args;
                    }else {
                      return fn(args.splice(0));
                    }
                  }
                }
              }
            }),
            (function children() {
              var eff = this, io = this.klass('IO');
              var qry = this.get('effects.dom.elements.query'), query = this.eff('dom.elements.query').init();
              return this.fn.curry(function children(effect, element) {
                return function(selector) {
                  return (element instanceof io.$ctor ? element : ((typeof element == 'string' ? query.ap(element) : io.of(element)))).toMaybe().map(function(mbel) {
                    return mbel.map(function(elem) {
                      return Array.prototype.concat.apply([], (elem instanceof Array ? elem : [ elem ]).map(function(el) {
                        return qry(selector, el);
                      }));
                    }).orElse([]).unit();
                  }).lift(function(arr, io) {
                    return arr.ap(io);
                  }).ap(effect && typeof effect == 'string' ? eff.eff(effect).init().nest() : (effect instanceof io.$ctor ? effect.nest() : io.pure(effect).nest()));
                };
              });
            }),
            (function recycle(make, wrap) {
              return function recycle() {
                return this.fn.curry(make(wrap, this.eff('dom.elements.attrs').init()));
              }
            })(
              (function(wrap, attrs) {
                return function recycle(rndr, elems) {
                  return wrap(attrs, rndr, elems.toMaybe().run().map(function(elem) {
                    var arr = [];
                    while (elem.firstElementChild) {
                      arr.push(elem.firstElementChild);
                      elem.removeChild(elem.firstElementChild);
                    }
                    return arr;
                  }).orElse([]).unit(), elems);
                }
              }),
              (function(attrs, rndr, elems, wrapp) {
                return function(value) {
                  return elems && elems.length
                    ? wrapp.run().appendChild(attrs.run(elems.shift())(value).unit())
                      : rndr.run(value).unit();
                }
              })
            ),
            (function() {
              return [].slice.call(arguments).apply();
            })(
              (function(wrapper, make, collector, mapper, list, attr) {
                return wrapper(make, collector, mapper(list(attr)));
              }),
              (function $wrap(handler, collector, wrapper) {
                return function observer(store) {
                  return handler(wrapper(collector(store)));
                }
              }),
              (function $hndl(handler) {
                // observe a node tree; bail if it's already being observed.
                return function observeMutations(el) {
                  // For each ShadowRoot, we create a new MutationObserver, so the root can be
                  // garbage collected once all references to the `inRoot` node are gone.
                  // Give the handler access to the root so that an 'in document' check can
                  // be done.
                  if (!el.__observer) {
                    var observer = new MutationObserver(handler);
                    observer.observe(el, { childList: true, subtree: true });
                    el.__observer = observer;
                  }
                  return el._observer;
                };
              }),
              (function $store(nodes) {
                return function(adds) {
                  nodes.push.apply(nodes, adds);
                  return nodes;
                }
              }),
              (function $obsrvr(list) {
                return function(collect) {
                  return function observer(t) {
                    return collect(list(t));
                  };
                }
              }),
              (function $mapper(attr) {
                return function(mutations) {
                  var mx = mutations[0], trg = mx.target, info = [];
                  while (trg && trg !== document && !trg.host && !trg.hasAttribute('data-type')) {
                    if (trg.hasAttribute('data-bind-ext')
                      || trg.hasAttribute('data-bind-path')
                        || trg.hasAttribute('data-bind-node')) {
                      info.push(attr(trg));
                    }
                    trg = trg.parentNode;
                  }
                  if (mx && mx.type === 'childList' && mx.addedNodes) {
                    if (mx.addedNodes) {
                      return [].slice.call(mx.addedNodes).filter(function(n) {
                        return n.attributes && n.localName !== 'i' && n.localName !== 'svg' && n.getAttributeNames().find(function(a) {
                          return (a === 'id' || a.indexOf('data') === 0);
                        });
                      }).map(function(node) {
                        return { attrs: attr(node), info: info };
                      });
                    }
                  }
                  return [];
                }
              }),
              (function $attr(node) {
                return node.getAttributeNames().reduce(function(r, k) {
                   r[k] = node.getAttribute(k);
                   return r;
                }, {});
              })
            )
          ],
          easing: [
            (function(makeTransitionEnd, getSupported, getEmulator, handler) {
              return function transitionEnd() {
                return makeTransitionEnd(getSupported(), getEmulator, handler);
              }
            })(
              (function(support, emulate, handler) {
                return function transitionEnd(elem, callback, duration) {
                  support ? handler(elem, support.end, callback) : emulate(elem, duration, callback);
                  return elem;
                }
              }),

              /* ========================================================================
              * Bootstrap: transition.js v3.3.6
              * http://getbootstrap.com/javascript/#transitions
              * ========================================================================
              * Copyright 2011-2015 Twitter, Inc.
              * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
              * ======================================================================== */

                
              // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
              // ============================================================

              (function getSupported() {
                var el = document.createElement('purejs')

                var transEndEventNames = {
                  WebkitTransition : 'webkitTransitionEnd',
                  MozTransition    : 'transitionend',
                  OTransition      : 'oTransitionEnd otransitionend',
                  transition       : 'transitionend'
                }

                for (var name in transEndEventNames) {
                  if (el.style[name] !== undefined) {
                    return { end: transEndEventNames[name] }
                  }
                }

                return false // explicit for ie8 (  ._.)
              }),

              // http://blog.alexmaccaw.com/css-transitions
              (function emulateTransitionEnd(element, duration, callback) {
                var called = false;
                var handle = setTimeout(function() { callback(element) }, duration);
                return element;
              }),

              (function makeHandlerWrap(elem, name, callback) {
                function hndl(evt) {
                  elem.removeEventListener(name, hndl);
                  callback(evt);
                };
                elem.addEventListener(name, hndl, false);
              })

            ),
            (function make() {
              var calc = this.get('effects.dom.calc');
              var bezier = calc.get('bezier');
              return function make(name) {
                return bezier._cache[name]
                  || (bezier._cache[name] = calc.get('makefn').apply(undefined, bezier.get(name)));
              }
            })
          ],
          factory: {
            elements: {
              make: {
                args: [ 'utils' ],
                method: 'bind',
                bind: 'IO',
                lift: 'Maybe'
              },
              alert: {
                args: []
              },
              button: {
                args: []
              },
              html: {
                method: 'lift',
                lift: 'Maybe'
              },
              render: {
                method: 'just',
                bind: 'IO',
                lift: 'Maybe'
              },
              tr: {
                args: [],
                method: 'just'
              },
              style: {
                method: 'just'
              },
              css: {
                method: 'just'
              },
              size: {
                args: [],
                method: 'just'
              },
              styleinfo: {
                args: []
              },
              animate: {
                args: [ 'utils' ],
                method: 'just',
                bind: 'IO',
                lift: 'Maybe'
              },
              children: {
                args: [],
                method: 'just',
                bind: 'IO',
                lift: 'Maybe'
              },
              recycle: {
                args: [],
                method: 'just',
                bind: 'IO',
                lift: 'Maybe'
              }
            },
            easing: {
              defaults: {
                method: 'just',
                just: 'IO',
                lift: 'Maybe',
                bind: 'Cont'
              },
              transitionEnd: {
                args: []
              },
              make: {
                args: []
              }
            }
          }
        };
      })

    };

  });

});