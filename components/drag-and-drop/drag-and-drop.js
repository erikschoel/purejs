define(function() {

  return this.enqueue({

    name: 'drag-and-drop',

    deps: {

      core: [ 'pure', 'dom' ],

      templates: [ 'tmpl' ],

      components: [ 'view' ]

    }

  }, function() {

    return {
      ext: {
        main: function() {
          if (this.equals(this.view().parent())) {
            this.$wrap = this.$fn('render').run('main').run({});
          }else {
            this.$wrap = this.parent().$el();
          }
        },
        mixin: function(opts) {
          return this.lift(function(dd, comp) {
            return dd.constructor.create(dd.xtnd({ name: comp.cid(), parent: dd, view: comp.view() }, opts || {})).run(function(inst) {
              inst.proxy('change', 'drop', dd.cid() + '.drop');
              return { dd: dd, comp: comp, inst: inst };
            });
          });
        },
        enable: function(element, selector) {
          return this.state('enabled')
            || this.state('enabled', this.control('main').pure().run(this.control('main').create(element, selector)));
        },
        hide: function() {
          this.$fn('display').run('none');
        }
      },
      control: {
        main: {
          create: function(element, selector) {
            return { state: 'init', element: this.toggle('drag-and-drop'), selector: this.enable(element, selector).run() };
          },
          pure: function() {
            return this.klass('io').pure(function(state) {
              return this.fx(function(enable) {
                state.element.run();
                state.selector.run();
                state.enabled = !state.enabled;
                return state;
              });
            });
          },
          enable: function(element, selector) {
            var root = this.root();
            var view = root.view();
            return view.elms(view.eff('toggle').run('draggable'), element)(selector);
          },
          toggle: function(classname) {
            var root = this.root();
            return root.view().eff('toggle').run(classname).ap(root.$el());
          },
          nest: function() {
            return (this._nest || (this._nest = this.klass('io').of(this)));
          },
          find: function() {
            return (this._find || (this._find = sys.eff('dom.elements.find').init().run(document.body).toIO()));
          },
          moving: function() {
            return (this._moving || (this._moving = this.nest().lift(function(ctrl, moving) {
              return this.fx(function(evt) {
                ctrl._move.state = 'moving';
                return moving.run(ctrl._move.selector).chain(function(elem) {
                  if (elem.classList.contains('moving')) {
                    elem.style.left = (evt.x - 20) +'px';
                    elem.style.top  = (evt.y - 20) +'px';
                    var hover = document.elementFromPoint(evt.x, evt.y);
                    if (hover) {
                      if (hover.classList.contains('droppable')) {
                        ctrl.enter(hover.parentElement);
                      }else if (ctrl._drop) {
                        ctrl.leave(ctrl._drop);                     
                      }
                    }
                    moving.raf(elem);
                  }
                  return elem;
                }) || true;
              });
            }).run(this.root().view().eff('toggle').run('moving').ap(this.find()))));
          },
          adjust: function(evt) {
            if (this._move) {
              this._move.throttle = this.root().opts('throttle');
            }
          },
          click: function(evt) {
            if (evt.target)
              this.root().$proxy(evt, this.root().get('proxy', evt.type, evt.target.localName));
          },
          elem: function(area, evt, selector) {
            return area.matches(selector) ? area
              : (evt.target.closest(selector) || area.querySelector(selector)); 
          },
          make: function(evt) {
            var area = evt.currentTarget || evt.target;
            var root = this.root(), move, view = root.view();
            if (!this._move) {
              move = this._move = view.body('mousemove', '#root', this.move.bind(this), root.opts('throttle') || 50);
              move.identifier   = 'mv'+root.id();
              move.selector     = '[name="'.concat(move.identifier, '"]');
              move.draggable    = root.opts('draggable');
              move.dragging     = move.draggable.concat('.dragging');
              move.droppable    = root.opts('droppable');
              move.toggle       = this.toggle('dragging');
              move.moving       = this.moving();
              move.wrap         = root.opts('wrap');
            }
            this._move.state = 'make';
            return this._move;
          },
          init: function(evt) {
            if (!this._move) {
              this._move = this.make(evt);
            }
            this._move.state = 'init';
            return this._move;
          },
          start: function(evt) {
            if (!this._move) {
              this._move = this.init(evt);
              this._move.state = 'starting';
            }else if (this._move.state != 'init') {
              this._move.state = 'stopped';
            }else {
              var root = this.root(), view = root.view();
              var move = this._move = view.body(this._move);
              var area = evt.currentTarget || evt.target;
              var elem = this.elem(area, evt, this._move.draggable);
              if (elem) {
                var wrap = this.drag(elem, evt);
                wrap.setAttribute('name', move.identifier);
                move.state = 'starting'; this.move(evt);
                move.toggle.run();
              }
            }
          },
          move: function(evt) {
            if (this._move) this._move.moving.raf(evt);
          },
          cancel: function(evt) {
            if (this._move) {
              this._move.state = 'cancelled';
            }
          },
          stop: function(evt, hndl) {
            if (this._move) {
              this._move.state = 'stopping';
              var elem = document.querySelector(this._move.selector);
              if (!elem) elem = this.elem(evt.currentTarget || evt.target, evt, this._move.dragging);
              if (elem) {
                this._move.state = 'stopped';
                var root = this.root();
                var view = root.view();
                elem.classList.remove('dragging');
                elem.removeAttribute('name');
                if (this._move.wrap) {
                  elem.parentElement.removeChild(elem);
                }
                if (this._drop) {
                  root.parent().emit('change', 'drop', 'update', {
                    drag: elem,
                    drop: this._drop.parentElement
                  });
                  this.leave();
                }
                if (this._move) {
                  this._move.toggle.run();
                  this._move = view.removeEventListener(this._move);
                }
              }
            }
          },
          drag: function(elem, evt) {

            var root = this.root();
            var view = root.view();

            return (this._wrap || (this._wrap = this._move.wrap ? root.$el().lift(function(p, w) {
              var i = document.createElement('input');
              i.classList.add('drag-focus');
              w.appendChild(i);
              w.classList.add('dragging');
              p.appendChild(w);
              i.focus();
              return w;
            }).ap(root.$wrap.bindIO(function(el, elem) {
              var x = el.firstElementChild.cloneNode(), d;
              x.innerHTML = elem.outerHTML;
              [ 'data-id', 'data-path', 'data-key'].forEach(function(attr) {
                var data = elem.closest('[' + attr + ']');
                if (data) x.setAttribute(attr, data.getAttribute(attr));
              });
              return x;
            })) : root.$el().lift(function(el, elem) {
              elem.classList.add('dragging');
              return elem;
            }))).run(elem);
          },
          enter: function(trg) {
            //console.log('enter', trg);
            if (!this._drop || this._drop != trg) {
              if (this._drop) this._drop.classList.remove('hover');
              this._drop = trg;
              trg.classList.add('hover');
            }
            return trg;
          },
          leave: function(trg) {
            //console.log('leave', trg);
            if (this._drop && (!trg || this._drop == trg) && this._drop.classList.contains('hover'))
              this._drop = this._drop.classList.remove('hover');
            return this._drop;
          },
          over: function(evt) {
            var trg = evt.currentTarget;
            var nid = sys.find(evt.sid).identifier(true).last();
            var ref = trg.closest('.drag-and-drop');
            if (ref.id == nid) {
              //console.log('over', ref.id, nid, trg, evt);
              if (!this._over || this._over != trg) {
                if (this._over) this._over.classList.remove('hover');
                this._over = trg;
                trg.classList.add('hover');
              }
            }else {
              //console.log('skip', ref.id, nid, trg, evt);
            }
            return evt;
          },
          out: function(evt) {
            var trg = evt.currentTarget;
            if (this._over && this._over == trg && trg.classList.contains('hover')) this._over = trg.classList.remove('hover');
            return this;
          }
        }
      },
      tmpl: {

        attr: function() {

          return { 'class' : 'drag-and-drop dd-wrap' };
        }
      },
      opts: {
        throttle: 30,
        wrap: true,
        draggable: '.draggable',
        droppable: '.droppable'
      },
      events: {
        data: {
          'change:opts.%' : 'data.control.main.adjust'
        },
        dom: {
          'mouseover:.draggable > *' : 'data.control.main.over|10',
          'mouseout:.draggable > *' : 'data.control.main.out|10',
          'mousedown:.draggable'   : [ 'data.control.main.init', 'data.control.main.start|200' ],     
          'click:.draggable'       : 'data.control.main.cancel',
          'mouseup:.drag-and-drop' : 'data.control.main.stop'
        }
      }

    };

  });

});
