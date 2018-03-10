define(function() {

  return this.enqueue({

    name: 'slide-show',

    deps: {

      parent: 'modal',

      templates: [ 'tmpl' ],

      css: [ 'slide-show' ],

      json: [ 'slide-show' ],

      scripts: [ 'holder' ]

    }

  }, function() {

    return {

      ext: {
        create: function() {
          var state = this.state('slides') || this.state('slides',
            { curr: 0, prev: 0, next: 0 });
          this.renderBody('carousel', {});
          this.createButtons();

          var view = this.view();
          var find = view.parent('$fn.find');

          this.set('data.tmpl.carousel', find.ap('.carousel-inner'));
          return state;
        },
        createTest: function() {
          var slides = this.deps('json.slide-show.test');
          var result = slides.map(function(v, k, i) {
            if (!i) v.active = true;
            return v;
          });
          var slice = [].slice.call(arguments);
          return this.control('main').createSlides(slice.length ? result.slice.apply(result, slice) : result);
        },
        createButtons: function() {
          return this.control('main').createButtons();
        },
        createSlide: function() {
          return this.control('main').createSlide();
        }
      },

      control: {

        main: {

          createItems: function(target, tmpl, items) {
            var root = this.root();
            var view = root.view();
            var appn = view.eff('append').ap(root.get(target));
            var tmpl = view.tmpl(tmpl);

            return appn.lift(function(f, a) {
              return a.map(f);
            }).run(items.map(function(attrs) {
              return tmpl.run(attrs || {});
            })).map(function(i) {
              return i.chain(function(e) {
                return e.querySelector('img');
              });
            }).pure();
          },

          createButtons: function() {
            return this.createItems('data.tmpl.footer', 'control', [
              { control: 'prev', move: 'left'  },
              { control: 'next', move: 'right' }
            ]);
          },

          createSlides: function(slides) {
            return this.createItems('data.tmpl.carousel', 'slide-img', slides)(function(x) {
              Holder.run({ images: x });
            });
          }

        },

        slideshow: {

          move: function(evt) {
            var root  = this.root();
            var state = root.state('slides');
            if (state.curr == state.next) {
              state.prev = state.curr;
              state.ctrl = evt.currentTarget.getAttribute('data-control');
              state.move = state.ctrl == 'prev' ? 'right' : 'left';
              state.next = state.curr + (state.ctrl == 'prev' ? -1 : 1);
              return this.adjust(state);
            }
          },

          adjust: function(state) {
            return this.make().run(state);
          },

          make: function() {
            return (this._move || (this._move = this.klass('io').pure(function(show) {
              return this.fx(function(state) {
                return show.items.map(function(items) {
                  if (state.next < 0) {
                    items.classList.add('cycle');
                    state.next = items.childElementCount - 1;
                  }else if (state.next == items.childElementCount) {
                    items.classList.add('cycle');
                    state.next = 0;
                  }
                  var anim = [].slice.call(items.children).reduce(function(res, el, idx) {
                    if (idx == state.next) {
                      res.next = el;
                    }else if (idx == state.prev) {
                      res.curr = el;
                    }
                    return res;
                  }, {});
                  anim.curr.classList.add('out');
                  anim.curr.classList.remove('active');
                  items.classList.add(state.ctrl);
                  anim.next.classList.add('active');
                  items.classList.add('move');
                  show.end.run(items, function() {
                    items.className = 'carousel-inner';
                    anim.curr.classList.remove('out');
                    state.curr = state.next;
                  }).classList.add(state.move);

                  return state;
                }).run();
              });
            }).run({
              ctrl: this,
              items: this.root().$fn('find').ap('.carousel-inner'),
              end: this.root().view().eff('transitionEnd'),
              anim: sys.get('process.animFrame.enqueue')
            })));
          }
        }
      },

      tmpl: {

        attr: function() {

          return { 'class' : 'modal modal-fullscreen force-fullscreen', 'tabindex' : '-1', 'full' : true };
        }

      },
      events: {
        dom: {
          'click:.carousel-control'  : 'data.control.slideshow.move'
        }
      }
      
    };

  });

});