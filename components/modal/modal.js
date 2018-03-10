define(function() {

  return this.enqueue({

    name: 'modal',

    deps: {

      core: [ 'pure' ],

      components: [ 'view', '$form' ],

      templates: [ 'tmpl' ]

    }

  }, function(deps) {

    return {

      ext: {
        main: function() {
          var view = this.view();
          var find = view.parent('$fn.find');
          var back = this.bd();

          this.set('data.tmpl.header', find.ap('.modal-header'));
          this.set('data.tmpl.body',   find.ap('.modal-body'));
          this.set('data.tmpl.footer', find.ap('.modal-footer'));
        },
        bd: function() {
          return this.$bd || (this.ctor.prop('$bd', this.backdrop()));
        },
        backdrop: function() {
          return this.view().append('div', {'class':'modal-backdrop fade','style':'top:100%'}, 'body')
          .toIO().nest().lift(function(el, fn) {
            return el.of({ $el: el, toggle: el.ctor.lift(fn(el.run(), document.body, el.fx(function(arr) {
              return arr.map(function(id, idx) {
                var elem = document.getElementById(id);
                elem.style.zIndex = 1051+idx;
                elem.firstChild.style.paddingTop = (idx * 40)+'px';
                elem.firstChild.style.paddingLeft = (idx * 40)+'px';
                return elem;
              });
            }))) });
          }).ap(function(bdrp, body, mdls) {
            var transitionEnd = sys.eff('dom.easing.transitionEnd').init();
            var reqAnimFrame  = sys.get('process.animFrame.enqueue');
            var modalsOpen    = [];
            return function(elem, action) {
              if (elem.classList.contains('show') && action !== 'show') {
                var idx = modalsOpen.indexOf(elem.id);
                if (idx >= 0) modalsOpen.splice(idx, 1);
                if (modalsOpen.length) {
                  mdls.run(modalsOpen);
                }else {
                  transitionEnd.run(bdrp, function() {
                    bdrp.style.top = '100%';
                  });
                  body.classList.remove('modal-open');
                  bdrp.classList.remove('in');
                }
                reqAnimFrame(function() {
                  elem.classList.remove('show');
                  return true;
                });
                return 'none';
              }else if (elem.style.display === 'block' && action !== 'show') {
                elem.style.display = 'none';
                return 'none';
              }else if (action !== 'hide') {
                bdrp.removeAttribute('style');
                body.classList.add('modal-open');
                reqAnimFrame(function() {
                  bdrp.classList.add('in');
                  elem.classList.add('show');
                  if (modalsOpen.indexOf(elem.id)<0) modalsOpen.push(elem.id);
                  mdls.run(modalsOpen);
                  return true;
                });
                return 'block';
              }
            }
          }).run();
        },
        toggle: function(action) {
          return (this._toggle || (this._toggle = this.bd().lift(function(bd, elem) {
            return bd.toggle.run(elem);
          }).ap(this.$el()).run())).run(action);
        },
        initial: function() {
          return this.$fn('render').run('main').run({});
        },
        content: function(values, type) {
          this.control('main').createBody(type || 'message', values, true);
        },
        addForm: function(fields, name) {
          return this.control('main').createForm(name || 'form', fields);
        },
        addButton: function(/* value, text, style */) {
          var args = [].slice.call(arguments), value, text, style;
          if (args.length > 1) {
            value = args.shift();
            text  = args.shift();
            style = args.shift();
          }else {
            text  = args.shift();
            value = text.toLowerCase();
          }
          return this.control('main').createButton(value, text, style === false ? 'display: none' : style);
        },
        removeButton: function(name) {
          return this.get('data.main.buttons').clear(name);
        },
        renderBody: function(name, attrs, replace) {
          return this.control('main').createBody(name, attrs, replace);
        },
        title: function(title) {
          return this.data('main.header').set('title', title);
        },
        alert: function(/* name, type, text, style */) {
          var store = this.get('data.main.alert');
          var args  = [].slice.call(arguments);
          var name  = args.shift();
          var attrs = typeof args[0] == 'object' ? args.shift() : {};
          if (args.length && typeof args[0] == 'string') attrs.type = args.shift();
          if (args.length && typeof args[0] == 'string') attrs.text = args.shift();
          if (args.length) attrs.style = args.shift();
          var curr  = store.get(name);
          if (!curr) {
            if (!attrs.type) attrs.type = name;
            attrs.anim = true; attrs.toggle = 500;
          }
          return store.set(name, (curr || {}).clone(attrs));
        },
        hide: function() {
          return this.state('display', this.toggle('hide') && 'none');
        },
        show: function() {
          return this.state('display', this.toggle('show') && 'block');
        }
      },
      control: {
        main: {
          click: function(evt) {
            if (evt.value == 'close') this.root().hide();
          },
          initButton: function(value, text, style) {
            return { value: value, text: text || value, style: style || '' };
          },
          makeButton: function(values) {
            return this.root('data.main.buttons').set(values.value, values);
          },
          createButton: function(value, text, style) {
            return this.makeButton(this.initButton(value, text, style));
          },
          createForm: function(name, fields) {
            return this.klass('Cont').of(this.root().component(name, 'form')).bind(function(f) {
              f.fields(fields, 'main', true);
              f.attach(f.parent('data.tmpl.body'));
              return f;
            });
          },
          createBody: function(name, attrs, replace) {
            var root = this.root();
            var view = root.view();
            var appn = view.eff('append');
            if (replace) appn = appn.ap(view.eff('empty'));

            return appn.ap(root.get('data.tmpl.body')).lift(function(f, m) {
              return f(m);
            }).run(view.tmpl(name).run(attrs || {}));
          }
        },
        data: {
          footer: function(type, evt) {
            var root = this.root();
            var view = root.view();

            if (evt.action == 'create') {
              var make = (this._appn || (this._appn = view.eff('append').ap(root.get('data.tmpl.footer')).pure())).ap(view.eff(type).toMaybe());
              return make.run(evt.value).chain(function(result) {
                evt.value.done = true;
                return root.xtnd(evt.value, result);
              });
            }else if (evt.action == 'update') {
              return evt.value.$set.run(evt.value);
            }else if (evt.action == 'remove') {
              var btn = evt.value;
              if (btn.$el) btn.$el.parentElement.removeChild(btn.$el);
              return btn;
            }
          },
          button: function(evt) {
            return this.footer('button', evt);
          },
          alert: function(evt) {
            return this.footer('alert', evt);
          }
        }
      },
      tmpl: {

        attr: function() {

          return { 'class' : 'modal no-scroll', 'role' : 'dialog' };
        }
      },
      data: {

        main: {

          header: {},

          content: {},

          footer: {},

          buttons: {},

          alert: {}

        }
      },
      events: {
        dom: {
          'change:[data-bind-path]': 'binding',
          'click:button': 'data.control.main.click'
        },
        data: {
          //'change:data.main.%' : 'binding',
          'change:data.main.buttons.%' : 'data.control.data.button',
          'change:data.main.alert.%' : 'data.control.data.alert'
        }
      }

    };

  });

});

