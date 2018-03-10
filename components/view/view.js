define(function() {

  return this.enqueue({

    name: 'view',

    deps: {

      core: [ 'pure', 'dom' ],

      scripts: [ 'doT' ]

    }

  }, function() {

    return {
      init: function(deps) {
        return deps('core.pure')(function(sys) {
          return function(def) {

            var init = def.rdr.call({
              klass: sys.klass('Reader'), $cache: sys.get().ensure('cache.view'), $eff: def.$eff
            }).of(def.reader.init);

            def.ext.reader   = init.bind(def.reader.make);
            def.ext.$eff     = def.$eff;
            def.ext.doT      = def.doT(def.deps('scripts.doT'));

            def.ext.evts     = { name: 'evts', value: def.evts.call(sys) };
            def.ext.attach   = def.attach.$fn(sys.klass('io').lift(def.attach.$io));
            def.ext.free     = def.$free(sys.klass('io'), sys.get('events'), { eid: 0, pid: 0 });
            def.ext.fold     = def.fold.call(sys);
            def.ext.$updater = def.ext.fold.bind(def.binder(def.updater()));

            return { ext: def.ext, deps: def.deps };
          }
        })(this);
      },
      $wrap: function(trav, free) {
        return trav.call(this).run(free.call({
          $IO: sys.klass('$io'),
          $Free: sys.klass('$free'),
          $Coyo: sys.klass('$coyoneda')
        }));  
      },
      $proc: function() {
        return (this.$Proc = this.$IO.extend('Proc', {
          $base: this
        })).prop('$base');
      },
      $free: function($IO, store, proc) {
        return {
          name: 'free',
          value: this.$wrap.call(this.$proc.call({
            $IO: $IO, proc: store.set('proc', proc),
            store: store,
            queue: store.set('queue', { eid: 0, pid: 0, arr: [], proc: proc }),
            items: store.set('items', { eid: 0, pid: 0, arr: [], proc: proc }),
            bindings: store.node('bindings')
          }), this.traverse, this.free)
        };
      },
      attach: {
        $io: function(comp, child) {
          return comp.$el(comp.lookup('data.params.attach').lift(function(params, cid) {
            return params.get(cid) || params.get('any') || params.get('all');
          }).ap(child.cid()).orElse('*').unit());
        },
        $fn: function(io) {
          return function(child) {
            return io.run(this.parent()).run(child);
          }
        }
      },
      deps: function(deps) {
        this.deps = deps;
        return this;
      },
      doT: function(doT) {
        return function(str, attr) {
          return doT.compile(str, attr);
        }
      },
      reader: {
        init: function(ctx) {
          return this.item(ctx);
        },
        make: function(x) {

          var attach = x.lift().ap(function(ctx, selector) {
            return ctx.attach().map(function(elem) {
              return elem.map(function(e) {
                return e.parentElement;
              }).chain(function(e) {
                ctx.view.state('attach', e.id || e.className);
                return e;
              });
            }).runIO(selector ? ctx.eff('query').run(selector) : ctx.view.module().$el());
          }).run();//.run(/*selector*/);

          var render = x.lift().ap(function(ctx, type) {
            return ctx.render().ap(ctx.view.tmpl('item', type));
          }).run();//.run(/*type e.g. 'main' */).run(/* {title:'Testttt'} */);

          return this.of(unit).lift(function(r, v) {
            return v.el.fx(function(t, a) {
              if (!r.result) r.result = r.render.run(t).run(a);
              return r;
            });
          }).run({ attach: attach, render: render });
        },
        wrap: function(init, make) {
          return { init: init, make: make };
        },
        run: function(ctx) {
          return this.init(ctx);
        }
      },
      rdr: function() {
        return this.klass.extend(function EffReader(f) {
          this.$super.call(this, f);
        }, {
          $eff: this.$eff,
          eff: function(name, value) {
            return value ? (this.$eff[name] = value) : (name ? this.$eff[name] : this.$eff);
          },
          $cache: this.$cache,
          cache: function(type, path, value) {
            return (this.$cache.get(type) || this.$cache.node(type)).acc(path, value);
          },
          item: function(view) {
            return {
              reader: this,
              konst: this.sys().fn.$const,
              eff: function(name, value) {
                return this.reader.eff(name, value);
              },
              el: view.el,
              view: view.view,
              cache: this.cache !== false && view.cache !== false ? function(key, value) {
                return (this[key] = this.konst(value))();
              } : function(key, value) {
                return value;
              },
              io: function() {
                return this.cache('io', this.reader.klass('IO').of(this));
              },
              lift: function() {
                return this.cache('lift', this.io().lift(function(ctx, fn) {
                  return this.fx(function(value) {
                    return fn(ctx, value);
                  });
                }));
              },
              empty: function() {
                return this.cache('empty', this.eff('empty').ap(this.el));
              },
              replace: function() {
                return this.cache('replace', this.append().ap(this.empty()).pure());
              },
              render: function() {
                return this.cache('render', this.append().nest().lift(function(append, template) {
                  return append.run(template);
                }));
              },
              find: function() {
                return this.cache('find', this.eff('find').run(this.el.run()).toIO());
              },
              maybe: function() {
                return this.cache('maybe', this.find().toMaybe());
              },
              attrs: function() {
                return this.cache('attrs', this.eff('attrs').ap(this.el).pure());
              },
              append: function() {
                return this.cache('append', this.eff('append').ap(this.el).pure());
              },
              attach: function() {
                return this.cache('attach', this.eff('attach').to('io').ap(this.el).run());
              },
              display: function() {
                return this.cache('display', this.eff('display').ap(this.el).pure());
              }
            };
          }
        });
      },
      $eff: sys.run(function() {
        return {
          elem: this.eff('dom.elements.create').init('maybe', 'IO'),

          attr: this.eff('dom.elements.attr').init(),

          attrs: this.eff('dom.elements.attrs').init(),

          make: this.eff('dom.elements.make'),

          div: this.eff('dom.elements.make').run('div').run(),

          button: this.eff('dom.elements.button').init(),

          alert: this.eff('dom.elements.alert').init(),

          html: this.eff('dom.elements.html').init(),

          query: this.eff('dom.elements.query').init(),

          find: this.eff('dom.elements.find').init(),

          children: this.eff('dom.elements.children').init(),

          attach: this.eff('dom.elements.attach').init(),

          append: this.eff('dom.elements.append').init(),

          render: this.eff('dom.elements.render').init(),

          style: this.eff('dom.elements.style').init(),

          css: this.eff('dom.elements.css').init(),

          empty: this.eff('dom.elements.empty').init(),

          display: this.eff('dom.elements.display').init(),

          recycle: this.eff('dom.elements.recycle').init(),

          tr: this.eff('dom.elements.tr').init('bind', 'Maybe', 'IO'),

          transitionEnd: this.eff('dom.easing.transitionEnd').init(),

          toggle: this.eff('dom.elements.toggle').init(),

          observer: this.eff('dom.elements.observer').init('just')
        };
      }),
      ext: {
        state: function(key, value) {
          var parent = this.parent();
          parent.state(key, value);
          return parent;
        },

        queue: function(path) {
          return this._dom.getQueue('dom').lift(function(dom, node) {
            return dom.lookup(node.nid()).chain(function(node) {
              return node.store();
            });
          }).ap(path ? this.parent().module().lookup(path) : this.parent().maybe());
        },

        update: function(opts) {
          opts || (opts = {});
          this.$super.call(this.parent('view', this), opts);
          this._rules  = this.klass('Coyoneda').of(function(rules) {
            return function(monad) {
              return function(selector) {
                return monad.klass('Functor').of(rules).ap(monad).map(function(rule) {
                  return rule(selector);
                }).toMaybe();
              }
            }
          }, this.set('css', [])).lift(sys.eff('dom.elements.rules').init());
          this._tag   = this.eff('make').run(this.parent('data.tmpl.tag') || 'div').run();
          this._el    = this.parent('$fn.el', this._tag.of(this.attr()).lift(function(value, base) {
            return base.of(base.run(value));
          }).run(this._tag));

          this._body || (this.ctor.prop('_body', this.dom.run(document.body)));
          this._dom  = this.set('dom', opts.dom || this.dom.run(this._el.run()));
          this._item = this.parent('$fn', this.item(this._el));
          this._elms = this.eff('children').nest().lift(function(ch, fn) {
            return this.fx(function(effect, selector) {
              return ch.run(effect)(fn.ap(selector));
            });
          }).run(this.parent('$fn.find'));

          if (this.parent().deps) this.css();
        },
 
        enable: function(node) {
          return this.$el().lift(function(e, c) {
            return { elem: e, comp: c.parent('data.model') || c.parent()
             };
          }).ap(this).lift(function(o, u) {
            return this.fx(function() {
              if (!u.length()) {
                u.push({ comp: o.comp, elms: [ o.elem ], path: [] });
              }
            });
          }).run(this.$updater.fork({ uid: this.parent().uid(), arr: [] }));
        },

        updater: function() {
          return (this._updater || (this._updater = this.enable()));
        },

        rules: function(selector) {
          return this._rules.run(selector);
        },

        style: function() {
          return (this._style || (this._style = this.$el().lift(function(el, css) {
            return this.fx(function(selector) {
              return this.fx(css.run(el.closest(selector || '*')));
            }).map(function(css) {
              return css.fx(function(props) {
                return (props instanceof Array ? props : [ props ]).reduce(function(r, k) {
                  r[k] = css.run(k);
                  return r;
                }, {});
              }).toMaybe();
            });
          }).run(this.eff('css'))));
        },

        elms: function(effect, selector) {
          return this._elms.run(effect, selector);
        },
        ctx: function(el, cache) {
          return { view: this, el: el || this._el, cache: cache !== false };
        },
        read: function(el, cache) {
          return (this._read || (this._read = this.reader.run(this.ctx(el, cache))));
        },
        item: function(el) {
          return (function(view, item) {
            item.replace = view.eff('append').ap(item.empty).pure();
            item.render  = view.eff('append').ap(item.find).nest().lift(function(append, view) {
              return this.fx(function(type, selector) {
                if (!selector || typeof selector === 'string') {
                  return append.ap(selector || '*').pure().ap(view.tmpl('item', type));
                }else if (this.is(selector)) {
                  return append.ap(selector).pure().ap(view.tmpl('item', type));
                }else {
                  return append.ap('*').pure().ap(view.tmpl.apply(view, selector ? [ type, selector ] : [ type ]));
                }
              });
            }).run(view);
            item.reader = view.$el().lift(function(elem, attr) {
              return elem.maybe().map(function(e) {
                return e.hasAttribute(attr) ? e : e.querySelector('[' + attr + ']');
              }).map(function(e) {
                return e.getAttribute(attr);
              });
            });
            return item;
          })(this, {
            el:      el,
            view:    this,
            find:    this.eff('find').run(el.run()).toIO(),
            attrs:   this.eff('attrs').ap(el).pure(),
            append:  this.eff('append').ap(el).pure(),
            attach:  this.eff('attach').ap(el).pure().ap(this.eff('query')),
            empty:   this.eff('empty').ap(el),
            display: this.eff('display').ap(el).pure(),
            query:   el.nest().lift(function(elem, query) {
              return this.fx(function(selector) {
                return elem.map(function(el) {
                  return query.run(selector, el);
                }).run();
              });
            }).run(sys.eff('dom.elements.query').init('just'))
          });
        },

        $el: function(selector) {
          return selector ? (this._find || (this._find = this.eff('find').ap(this._el).run().toIO().toMaybe())).run(selector) : this._el;
        },

        on: function(name, selector, handler, throttle) {
          return this._dom.addEventListener(this._el.run(), 'dom', name, selector, handler, throttle);
        },

        body: function(/* name, selector, handler, throttle */) {
          return this._body.addEventListener.apply(this._body, [].slice.call(arguments).prepend(document.body, 'dom'));
        },

        elem: function(tag) {
          var store = this._tags || (this.constructor.prototype._tags = this.ctor.$store.node('tags'));
          return store.get(tag) || store.set(tag, this.eff('elem')(tag));
        },

        tag: function(tag) {
          var store = this._elems || (this.constructor.prototype._elems = this.ctor.$store.node('elems'));
          return store.get(tag) || store.set(tag, this.eff('make').run(tag).run());
        },

        attr: function() {
          return this.get('attr') || this.set('attr', sys.get('utils.extend')({ id: this.parent().nid(), 'data-type': this.parent().origin() }, this.tmpl('attr')));
        },

        css: function(name) {
          return this.lift(function(v, t) {
            return t.bind(function(name) {
              return v.push('css', v.eff('style').map(function(link) {
                return link ? link.sheet : {};
              }).to('io').run(v.render(name).run({}), v.uid()));
            }).run();
          }).ap(this.maybe().map(function(view) {
            var c = view.parent().ctor, r = [], p, a;
            while (c) {
              r.push.apply(r, (sys.get('link.idx.valueMap').run('scripts', 'style.' + c.name(), true) || []).filter(function(k) {
                return r.indexOf(k) < 0;
              }));
              if (c.level() > 3) c = c.parent();
              else break;
            }
            return r;
          }));
        },

        type: function() {
          return (this._tmpl || (this._tmpl = this.parent().deps('templates.tmpl')));
        },

        tmpl: function(path) {
          return (this.parent('data').get('tmpl', path) || this.$tmpl(path)).apply(this, [].slice.call(arguments, 1));
        },

        $tmpl: function(name) {
          return function(attrs) {
            var view = this;
            var type = attrs && typeof attrs == 'string' ? attrs : (name || 'main');
            var item = view.get(type);
            if (!item) {
              if (attrs && typeof attrs == 'object') {
                var elem = view.eff('div');
                var html = view.eff('html').ap(elem.ap(elem.of(attrs))).pure();
              }else {
                var html = view.eff('render').ap('div').pure().toMaybe();
              }
              item = view.set(type, html.ap(view.render(type)));
            }
            return item;
          }
        },

        paths: function(path) {
          return (this._paths || (this._paths = this.node('paths'))).get(path);
        },

        module: function() {
          return this.parent().module();
        },

        closest: function(selector) {
          return (this._closest || (this._closest = this.lift(function(view, selector) {
            return view._el.map(function(elem) {
              if (elem.matches(selector)) return view;
              var el = elem.closest(selector), st;
              if (el) st = sys.find(el.id.replace(/[^0-9]/g, ''));
              if (st) return st.view();
            }).run();
          }))).run(selector);
        },

        dbpt: function() {
          if (!this._dbpt) {
            this._dbpt = this.parent('$fn.find').toMaybe().map(function(x) {
              return x.map(function(el) {
                return Array.prototype.concat.apply([], el.querySelectorAll('[data-bind-name]'));
              }).orElse([]).unit();
            });
          }
          return this._dbpt;
        },

        bindnode: function() {
          return this.parent('$fn.reader').run('data-bind-node').map(function(node) {
            return sys.find(node);
          }).lift(function(node, path) {
            return node.parent(path);
          }).ap(this.parent('$fn.reader').run('data-bind-path'))
        },

        bindelem: function(elem) {
          var path = [ elem.getAttribute('data-bind-name') ].filter(function(path) {
            return path && path.indexOf('style:');
          });
          while (elem && (elem = elem.parentElement)) {
            if (elem.hasAttribute('data-bind-ext')) {
              path.unshift(elem.getAttribute('data-bind-ext'));
            }else if (elem.hasAttribute('data-bind-path')) {
              path.unshift(elem.getAttribute('data-bind-path'));
              break;
            }
          }
          return path;
        },

        bindpath: function() {
          return this.parent('$fn.reader').run('data-bind-path');
        },

        binding: function(evt) {
          if (evt.src == 'data' && evt.action !== 'remove') {
            if (!this.is(evt.value) && typeof evt.value != 'object') {
              this.updater().run(evt);
              return evt;
            }
          }
        },

        thread: function() {
          return (this._thread || (this._thread = this.free.run(this)));
        },

        click: function(evt, hndl) {
          var data = evt.currentTarget.getAttribute('data-click'), path, func;
          if (data) {
            path = data.split('.');
            func = path.pop();
            return this.parent().lookup(path).chain(function(base) {
              return base[func].call(base, evt, hndl);
            });
          }
        },

        dispatch: function(type, elem) {
          var evt = document.createEvent('HTMLEvents');
          evt.initEvent(type, true, true);
          elem.dispatchEvent(evt);
          return evt;
        },

        append: function(tag, attrs, selector) {
          return this.eff('attach').ap(this.tag('div').run(attrs)).pure().ap(this.eff('query')).run(selector);
        },

        render: function(type, attr) {
          return this.maybe().map(function(view) {
            return view.type();
          }).map(function(t) {
            return t.get(type);
          }).lift(this.doT).ap(attr || this.lookup('attr').orElse({})).lift(function(tmpl, data) {
            return tmpl(data && data['$key'] ? data[data['$key']] : (data || {}));
          }).toMaybeIO();
        }
      },
      binder: function(attr) {
        return function(result) {
          return this.done(result.map(attr.run(result.shift())));
        }
      },
      updater: function() {
        return sys.eff('dom.elements.attr').lift(function(attr, comp) {
          return function(item) {
            if (item) {
              return comp.lookup(item.path).lift(function(node, name) {
                return node.lookup(name).chain(function(value) {
                  return attr.run(item.elem)(name.indexOf(':') < 0 ? 'value' : name.split(':').shift(), value);
                });
              }).ap(item.elem.getAttribute('data-bind-name'));
            }
            return item;
          }
        });
      },
      fold: function() {
        return this.klass('Free').$ctor.queue(function(fold) {
          return function(v) {
            if (v.length) {
              if (v[0].comp) {
                this.push(v[0].comp);
              }
              if (!v[0].elms.length) {
                v.shift();
              }
            }
            if (v.length) {
              var o = v[0], i = o.elms.shift(), p;
              if (fold.collect(i) && o.path.length) {
                this.push({ elem: i, path: o.path.join('.') });
              }
              if (fold.skip && fold.skip(i)) {
                //
              }else if (i.children && i.children.length) {
                if (i.hasAttribute('data-bind-ext')) {
                  v.push({ path: o.path.concat(i.getAttribute('data-bind-ext')), elms: [].slice.call(i.children).filter(fold.filter) });
                }else if (i.hasAttribute('data-bind-path')) {
                  v.push({ path: o.path.concat(i.getAttribute('data-bind-path')), elms: [].slice.call(i.children).filter(fold.filter) });
                }else {
                  v.push({ path: o.path, elms: [].slice.call(i.children).filter(fold.filter) });
                }
              }
              if (!v[0].elms.length) {
                v.shift();
              }
            }
            return v.length ? this.cont() : this.done(this.flush());
          }
        })([]).lift({
          collect: function(i) {
            return i.matches('[data-bind-name]');
          },
          skip: function(i) {
            return (i.localName === 'svg' || i.localName === 'i');
          },
          filter: function(i) {
            return i.localName !== 'svg' && i.localName !== 'i' && !i.matches || !i.matches('[data-type="component"]');
          }
        });
      },
      evts: function() {
        return this.eff('dom.elements.attr').init().nest().lift(function(attr, fn) {
          return function(elem) {
            return fn(attr.run(elem), elem, elem.getAttribute('data-bind-name'));
          };
        }).run(function(attr, elm, dbn) {

          return function(evt) {

            if (elm) {
              var arr = evt.ref.split('.');
              var fld = dbn.indexOf('.') > 0 ? [ arr.pop(), evt.target ].join('.') : evt.target;

              if ((dbn == fld)
                
                || (fld != evt.target && dbn == evt.target)

              ) {

                attr('value', evt.value);

                //console.log(dbn, fld, evt.target, evt.ref);

              }
            }
            evt.cnt && evt.cnt--;
            return evt;
          }
        });
      },
      free: function() {
        return this.$IO.pure(this.$Free.$ctor.queue(this.$Coyo.of(function(handler) {
          return function(v) {
            if (v.length) {
              var i = v.shift();
              if (i.matches('[data-bind-name]')) {
                this.push(i);
              }
              if (i.localName == 'svg' || (i.hasAttribute('data-type') && i.id !== handler.vid)) {
                console.log('!! SKIP !!', i, handler.vid);
              }else if (i.children && i.children.length) {
                v.push.apply(v, [].slice.call(i.children).filter(function(elem) {
                  return !elem.matches('[data-type]') && (elem.childElementCount || elem.matches('[data-bind-name]'));
                }));
              }
            }
            return v.length ? this.cont() : this.done(handler.flush(this.flush()));
          }
        })));
      },
      traverse: function() {
        return this.$IO.of({
          $Proc: this.$Proc,
          proc: this.proc,
          store: this.store,
          bindings: this.bindings,
          queue: this.$IO.of(this.queue).map(function(queue) {
            return queue;
          }).lift(function(queue, handler) {
            return handler.run(queue.arr);
          }),
          items: this.$IO.of(this.items).lift(function(queue, fn) {
            return this.fx(function(view) {
              var monad = fn(queue, view);
              monad.vid = view.parent().nid();
              return monad;
            });
          }).run(function(queue, view) {
            return {
              count: function(evt) {
                return ((evt.cnt ? ++evt.cnt : (evt.cnt = 1))
                  &&  ((evt.max || (evt.max = evt.cnt)) < evt.cnt));
              },
              push: function(evt) {
                ((evt.cnt ? ++evt.cnt : (evt.cnt = 1))
                  &&  ((evt.max || (evt.max = evt.cnt)) < evt.cnt));
                if (evt.eid > queue.eid && !evt.pid) {
                  evt.pid = queue.eid = evt.eid;
                  queue.arr.push(evt);
                }else {
                  console.log(evt.cnt, evt.eid, queue.eid, view.uid());
                }
                return queue;
              },
              flush: function(elms) {
                elms.map(function(e) {
                  return queue.arr.slice(0).map(view.evts(e));
                });
                return elms;
              },
              fflush: function(elms) {
                view.evts.ap(elms).bind(view.bin(function(v, f) {
                  return queue.arr.slice(0).map(f.bind(v));
                })).run(this.cleanup);
                return elms;
              },
              cleanup: function() {
                var i = 0;
                if (!queue.block && (queue.block = true)) {
                  while (i < queue.arr.length) {
                    if (queue.arr[i].max && !queue.arr[i].cnt) {
                      queue.arr.splice(i, 1);
                    }else {
                      i++;
                    }
                  }
                  queue.block = false;
                }
                return queue.arr;
              },
              run: function(elem) {
                console.log('!! RUN !!', elem, queue.arr.length, queue.vid);
                if (queue.arr.length) {
                  if (!queue.arr.run(elem)) {
                    queue.arr.shift();
                  }
                }
                return elem;
              }
            };
          })
        }).lift(function(base, free) {
          return this.of({
            proc: base.proc,
            store: base.store,
            bindings: base.bindings,
            queue: base.queue.run(free),
            items: base.items
          }).lift(function(base, thread) {
            return this.fx(function(view) {
              console.log('create-bindings: ', view.identifier());
              var hndl = base.items.run(view);
              var node = base.bindings.node(hndl.vid);
              node.set('handler', hndl);

              var fork = node.set('queue', base.queue.lift(hndl).bind(function(x) {
                console.log(hndl.vid, x);
                return this.done(x);
              }).fork({ vid: hndl.vid, arr: [] }));
              return thread(fork, hndl, view.$el().run());
            });
          }).run(function(thread, handler, elem) {
            return function(evt) {
              //if (!thread.length()) {
                thread.push(elem);
              //}
              return handler.push(evt);
            };
          });
        });
      }
    };

  });

});