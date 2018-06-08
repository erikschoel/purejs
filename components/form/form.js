define(function() {

  return this.enqueue({

    name: 'form',

    deps: {

      core: [ 'pure', 'dom' ],

      templates: [ 'tmpl' ],

      components: [ 'view' ]

    }

  }, function() {

    return {

      ext: {
        initialize: function() {
          return this.control('main').init();
        },
        fields: function() {
          var args = [].slice.call(arguments);
          var data = args.shift();
          var make = args.length && args.last() === true ? args.pop() : false;
          var ctrl = this.control('main');
          if (args.length) this.bindpath(args.shift());
          this.get('data').clear('fields');
          this.data({ fields: data }, 2).get('fields');
          if (make) ctrl.make();
          return this;
        },
        list: function(path) {
          return this.control('main').list(path);
        },
        hide: function() {
          this.$fn('display').run('none');
          return this;
        }
      },
      control: {
        main: {
          make: function() {
            this.root().$fn('empty').run();
            return this.fields();
          },
          lift: function() {
            return this.klass('io').of(this.root()).lift(function(form, elem) {
              var mod = form.module();
              var ext = elem.closest('[data-bind-ext]');
              var rel = form.relative(form.module());
              if (ext) rel.push(ext.getAttribute('data-bind-ext'));
              if (elem.id) rel.push(elem.id);
              var kls = elem.getAttribute('data-klass'); elem.removeAttribute('data-klass');
              var cmp = mod.component(rel.join('.'), kls).bind(function(cmp) {
                cmp.attach(cmp.set('data.attachto', elem));
                return cmp;
              });
              return cmp.pure();
            });
          },
          init: function() {
            return (this._init || (this._init = this.root().view().elms(this.lift(), 'div')('[data-klass]'))).run().run(function(x) {
              (x instanceof Array ? x : [ x ]).map(function(comp) {
                comp.initialize();
                return comp.get('data.attachto');
              });
            });
          },
          form: function(rndr, attr, flds, path, schema) {
            return flds.map(function $fn(items, prefix) {
              return items.map(function $fn(t, k) {
                var v = t.elem;
                if (v) {
                  v.id = prefix + '.' + k;
                  v.name = prefix;
                  v.dbid = t.name || t.dbid;
                  if (v.data) {
                    var d = v.data.split(':'), o, x;
                    if (d.length > 1) {
                      o = d.shift();
                      x = sys.get('utils.fn')(sys.get(d.join('.')));
                      if (x && x.isStore) v[o] = x.map(function(v, k) {
                        return { value: k, label: v.get('attr.desc') || v.get('attr.code') };
                      }).map(function(v) {
                        if (!v.label) v.label = v.value;
                        return v;
                      });
                      else if (x) v[o] = x.map(function(t) {
                        return t.label || t.text || t.value || t;
                      });
                    }
                  }
                  if (v.type == 'choice') {
                    v.tag = 'radio';
                  }else if (v.type == 'multiple') {
                    v.tag = 'multiple';
                  }else if (v.tag == 'component') {
                    v.path = path;
                  }else if (v.tag == 'select') {
                    if (!v.options) v.options = [];
                    else if (typeof v.options === 'string') v.options = v.options.split(',');
                    v.empty = v.empty !== false;
                  }else if (v.tag == 'func') {
                    v.tag = 'component';
                    v.klass = 'code-edit';
                    v.path = path;
                  }else if (v.tag == 'choice') {
                    v.tag = 'radio';
                  }else if (!v.tag) {
                    v.tag = 'input';
                  }
                  return rndr.run(v.tag).run(v).map(function(elem) {
                    return v.attrs ? attr.ap(elem).pure().run(v.attrs) : elem;
                  });
                }else if (k === 'schema') {
                  return rndr.run('list').run({ path: t }).map(function(elem) {
                    elem.classList.add(t);
                    return elem;
                  });
                }
              });
            });
          },
          rndr: function() {
            return (this._rndr || (this._rndr = this.root().get('view').parent('$fn.render').nest().lift(function(rndr, find) {
              return this.fx(function(tmpl) {
                return rndr.run(tmpl, find);
              });
            })));
          },
          load: function(form, node) {
            return function(elem) {
              node.reference(elem.getAttribute('data-load-name')).chain(function(load) {
                elem.innerHTML = form.view().render(
                  load, { bind: elem.getAttribute('data-bind-id') }
                ).run(node.object({ id: 'attr.answer', type: node.get('dbid') }));
              });
            };
          },
          loading: function(form, node) {
            return form.$fn('query').run('[data-load-name]').map(this.load(form, node));
          },
          show: function(path, node) {
            var form = this.root();
            var ctrl = this;
            var list = node.lookup(path).chain(function(list) {
              return form.$el('.form-list.' + path).map(function(el) {
                return [].slice.call(el.children).map(function(e) {
                  e.classList.add('hide');
                  return e;
                });
              }).chain(function(items) {
                var count = items.length;
                list.nodes().map(function(v, i) {
                  if (count > i) {
                    items[i].classList.remove('hide');
                  }else {
                    ctrl.list(path, path !== 'rcrds');
                  }
                });
                return ctrl.init();
              });
            });
            return node;
          },
          list: function(path, schema) {
            var form = this.root();
            var view = form.view();
            var elem = view.parent('$fn.render').run('group', '[data-bind-ext="' + path + '"]').run({}).map(function(e) {
              var prnt  = e.parentElement;
              var path  = prnt.getAttribute('data-bind-ext');
              var count = prnt.childElementCount - 1;
              e.setAttribute('data-bind-ext', count);
              if (!count) e.classList.add('top');
              return e;
            });
            var rndr = this.rndr().run(elem.toIO());
            var attr = view.eff('attrs');
            return this.form(rndr, attr, this.of(form.get('data.fields', form.cid(), 'fields')), form.state('path'), schema);           
          },
          fields: function() {
            var form = this.root();
            var view = form.view();
            var rndr = view.parent('$fn.render');
            var attr = view.eff('attrs');
            return this.form(rndr, attr, form.get('data.fields'), form.state('path'));
          },
          options: function(id, options) {
            var root = this.root();
            var view = root.view();
            var elem = view.parent('$fn.find').ap('#'+id);
            var html = elem.apply(view.eff('empty')).apply(view.eff('html')).pure();
            return html.run(options.map(function(o) {
              return '<option>' + o + '</option>';
            }).join('')).chain(function(elem) {
              var value = root.get(elem.closest('[data-bind-path]').getAttribute('data-bind-path'), elem.id);
              return elem.value = value;
            });
          },
          click: function(evt) {
            if (evt.type === 'click') {
              if (evt.value === 'edit') {
                return this.root().control('select').edit(evt);
              }else if (evt.value === 'record') {
                return this.root().control('select').record(evt);
              }else if (evt.value === 'fas') {
                return this.root().control('select').icon(evt);
              }
            }
            return this.proxy(evt);
          },
          proxy: function(evt) {
            var root = this.root();
            var view = root.view().closest('[data-bind-path]');
            if (view) {
              var elem = evt.target;
              var trg  = elem.getAttribute('data-value') || evt.value;
              var ext  = view.bindelem(elem).slice(-2).join('.');
              root.maybe().map(function(node) {
                var mod = node.module();
                var rel = node.relative(mod);
                var ref = rel.concat('button.' + trg).join('.');
                mod.emit('change', 'button.' + trg, 'update', ext);
                mod.get(rel).emit('change', 'button.' + trg, 'update', ext);
                node.emit('change', 'button.' + trg, 'update', ext);
                return mod.current().get('modal.model');
              }).chain(function(node) {
                return node.emit('change', 'button.' + trg, 'update', ext);
              });
            }
          }
        },
        select: {
          make: function(fn) {
            return sys.lookup('schema.$app').lift(fn);
          },
          model: function() {
            return (this._model || (this._model = this.root().lookup('data.model').orElse(this.root().parent().get('modal.data.model'))));
          },
          path: function(evt) {
            return this.root().view().bindelem(evt.currentTarget);
          },
          ref: function(evt) {
            return sys.get('schema.$app').get(this.model().prop('cid').unit(), this.path(evt).merge([ 'nodes', 'madi' ]).slice(1, -1));
          },
          node: function(evt) {
            //return sys.get('model').lookup(this.root().view().bindelem(evt.currentTarget));
            //return this.root().lookup('data.model').get(this.path(evt));
            //return this.root().lookup('data.model').prop('locate', this.path(evt));
            return this.model().prop('locate', this.path(evt));
          },
          field: function(evt, attr) {
            return evt.currentTarget.maybe().map(function(elem) {
              return elem.getAttribute(attr || 'data-value');
            }).orElse('');
          },
          madi: function(evt) {
            return this.model().prop('current').prop('schema').get(['nodes',this.root().cid(),'madi']).unit();
          },
          handler: function(field, handler) {
            return function(rec, mod) {
              return handler(rec, mod, field);
            }
          },
          run: function(evt, query, action, handler) {
            return this.node(evt).lift(function(record, make) {
              return make(record).map(action).chain(function(io) {
                return io.run(record.bin(handler));
              });
            }).ap(this.make(query));
          },
          query: function(schema, record) {
            return record.lookup('madi').map(function(marl) {
              return schema.lookup(marl).chain(function(item) {
                return item.get('meta.query');// || item.get('attr.code');
              });
            }).orElse(schema.lookup(record.get('marl')).chain(function(item) {
              return item.get('meta.query') || item.get('attr.code');
            }));
          },
          lookup: function(schema, record) {
            return 'lookup'.maybe();
          },
          record: function(evt) {
            if (evt.currentTarget.getAttribute('data-name')) {
              return this.run(evt, this.lookup, function(query) {
                return sys.get('components.app').record(query);
              }, this.handler(this.field(evt), function(rec, mod, field) {
                return mod.observe('change', 'state.value', function(evt, hndl) {
                  if (evt.value) {
                    mod.removeEventListener(hndl);
                    sys.get('api').get('db.load.schema').request().run({ query: [ evt.value, rec.get('madi') ] }).run(function(result) {
                      rec.set('attr.record', result.madr);
                    });
                  }
                });
              }));
            }else {
              return this.run(evt, this.query, function(query) {
                return sys.get('components.app').record(query);
              }, this.handler(this.madi(evt) || this.ref(evt), function(rec, mod, madi) {
                return mod.observe('change', 'state.value', function(evt, hndl) {
                  if (evt.value) {
                    mod.removeEventListener(hndl);
                    sys.get('api').get('db.load').request().run({ query: [ evt.value, madi ] }).run(function(result) {
                      var name = Object.keys(result).first();
                      var data = sys.get('schema.$app').control('main').add(result[name].madi, result[name], true);
                      rec.clear();
                      rec.parse(data, true);
                    });
                  }
                });
              }));
            }
          },
          edit: function(evt) {
            return this.run(evt, function(schema, record) {
              return record.lookup('marr').map(function(marr) {
                  return marr ? ('mare_' + marr) : null;
              }).orElse(record.lookup('madr').chain(function(madr) {
                  return madr ? ('madr_' + madr) : null;
              })).orElse(record.get('dbid'));
            }, function(query) {
              return sys.lookup('components').map(function(app) {
                return app.get('loader').run(app, { value: query }, true);
              });
            }, this.handler(this.field(evt), function(rec, mod, field) {
              debugger;
            }));
          },
          fas: function(schema, record) {
            return 'fas'.maybe();
          },
          icon: function(evt) {
            return this.run(evt, this.fas, function(query) {
              return sys.get('components.app').fas(query);
            }, this.handler(this.field(evt, 'data-name'), function(rec, mod, field) {
              return mod.observe('change', 'state.value', function(evt, hndl) {
                if (evt.value) {
                  mod.removeEventListener(hndl);
                  return field.chain(function(fld) {
                    return rec.set(fld, evt.value);
                  });
                }
              });
            }));
          }
        }
      },
      events: {
        dom: {
          'click:.btn': 'data.control.main.click',
          'change:[data-bind-path]': 'binding'
        },
        data: {
          //'change:data.main.%' : 'binding'
        }
      }
    };

  });

});
